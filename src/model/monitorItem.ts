import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as ini from 'ini';

import { IMonitorItem, IError, createError, Severity } from '../monitorInterfaces';
import { getLanguageClient } from '../ls/monitorClient';

const ATT_REQ = "Atributo requerido.";

export class MonitorItem implements IMonitorItem {
	//TODO: Adicionar árvore de pastas
	parent: string = "/";
	id: string = "";
	type: string = "protheus";
	name: string = "";
	port: number = 0;
	address: string = "";
	buildVersion: string = "";
	secure: boolean = false;
	includes: string[] = [];
	environments: string[] = [];
	smartClient: string = "";
	token: string = "";
	environment: string = "";
	errors: IError[] = [];
	reconnectToken: string = "";
	needAuthentication: boolean = false;
	username: string = "";
	password: string = "";
	authenticationToken: string = "";

	public initialize(content: any): boolean { //JSON format
		let needUpdate = false;

		for (const key in content) {
			if (this.hasOwnProperty(key)) {
				if (this[key] !== content[key]) {
					if (typeof this[key] === "string") {
						content[key] = content[key].trim ? content[key].trim() : content[key];
					}
					this[key] = content[key];
					needUpdate = true;
				}
			} else {
				console.warn(`doUpdateProperty: not found property ${key} for ${content.name}`);
			}
		}

		if (this.reconnectToken === "") {
			this.reconnectToken = this.token;
		}

		return needUpdate;
	}

	public updateProperties(content: any): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			return resolve(this.doUpdateProperties(content));
		});
	}

	private doUpdateProperties(content: any): boolean { //JSON format
		let needUpdate = this.initialize(content);

		this.doValidate();

		return needUpdate;
	}

	public async validate(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			resolve(this.doValidate());
		});
	}

	private async doValidate() {
		const error = (id: keyof IMonitorItem, message: string) => {
			this.errors.push(createError(Severity.ERROR, id, message));
		};
		const warn = (id: keyof IMonitorItem, message: string) => {
			this.errors.push(createError(Severity.WARN, id, message));
		};

		this.errors = [];

		this.validateSmartClient().forEach((message: string) => {
			error("smartClient", message);
		});

		if (this.type === "") { error("type", ATT_REQ); }
		if (this.name === "") { error("name", ATT_REQ); }
		if (!(this.port > 0)) { error("port", ATT_REQ); }
		if (this.address === "") { error("address", ATT_REQ); }
		if (this.includes.length === -1) { warn("includes", "Lista de pastas para busca não informada."); }

	}

	private validateSmartClient(): string[] {
		const file = this.smartClient;
		const problems: string[] = [];

		if (file === "") {
			problems.push(ATT_REQ);
		} else {
			const scFile = vscode.Uri.parse("file:///" + file);

			if (fs.existsSync(scFile.fsPath)) {
				const ext = path.extname(scFile.fsPath);
				const configFile = scFile.fsPath.replace(ext, ext === ext.toLocaleLowerCase() ? ".ini" : ".INI");

				if (fs.existsSync(configFile)) {
					if (this.address === "") {
						try {
							const buffer = fs.readFileSync(configFile);
							const content = buffer.toString().toLowerCase();
							const parseIni = ini.parse(content);
							const drivers = parseIni.drivers;
							const active = drivers.active;
							const config = parseIni[active];
							const address = config.server;
							const port = config.port;

							if (this.address !== address) {
								this.address = address;
								this.buildVersion = "";
							}
							if (this.port !== port) {
								this.port = port;
								this.buildVersion = "";
							}
						} catch {
							vscode.window.showWarningMessage(`Não foi possível obter os dados de conexão.\nArquivo: ${configFile}`);
						}
					}
				} else {
					problems.push("Arquivo de configuração não localizado. " + configFile);
				}
			} else {
				problems.push("Arquivo não localizado.");
			}
		}

		return problems;
	}

	public isConnected(): boolean {
		return this.token !== "";
	}

	public async connect(): Promise<boolean> {
		const lsc = await getLanguageClient();

		const type: number = (this.type === "totvs_server_protheus") ? 1 :
			(this.type === "protheus") ? 1 : 2;

		const request = await lsc
			.connect(13, type, this.id, this.name, this.address, parseInt("" + this.port), this.environment, this.buildVersion, this.secure)
			.then((value: any) => {
				this.token = value.token;
				this.needAuthentication = value.needAuthentication;

				return true;
			}, (reason) => {
				throw reason;
			});

		return request;
	}

	public async reconnect(): Promise<boolean> {
		const lsc = await getLanguageClient();

		const request = await lsc
			.reconnect(this.name, this.reconnectToken)
			.then((value: {
				connectionToken: string;
				environment: string;
				user: string;
			}) => {
				this.token = value.connectionToken;
				this.environment = value.environment;
				this.username = value.user;

				return true;
			}, (reason) => {
				throw reason;
			});

		return request;
	}

	public async validConnection(): Promise<any> {
		const lsc = await getLanguageClient();

		const request = await lsc
			.validation(this.address, parseInt("" + this.port))
			.then((value) => {
				this.buildVersion = value.build;
				this.secure = value.secure;
				return true;
			}, (reason) => {
				throw reason;
			});

		return request;
	}

	public async authenticate(): Promise<boolean> {
		const lsc = await getLanguageClient();
		this.authenticationToken = "";
		this.errors = [];

		const request = lsc
			.authenticate(this.token, this.environment, this.username, this.password)
			.then((value) => {
				this.authenticationToken = value;
				return (value.length > 0);
			})
			.finally(() => {
				if (this.authenticationToken === "") {
					this.errors.push(createError(Severity.ERROR, "username", "Credenciais inválidas"));
					this.errors.push(createError(Severity.ERROR, "password", "Credenciais inválidas"));
				}

				return (this.errors.length === 0);
			});

		return request;
	}
}

export class TreeMonitorItem extends vscode.TreeItem {

	public listSessions: Array<any /*SessionSection*/> = [];

	contextValue = 'monitorItem';

	constructor(
		public readonly serverItem: IMonitorItem,
		public collapsibleState?: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(serverItem.name, collapsibleState);
	}

	get tooltip(): string {
		return `${this.serverItem.address}:${this.serverItem.port} (${this.serverItem.type}${this.serverItem.secure ? ",SSL" : ""})`;
	}

	get description(): string {
		return `${this.serverItem.address}:${this.serverItem.port}`;
	}

	get sessions(): Array<any /*SessionSection*/> {
		return this.listSessions;
	}

	iconPath = {
		light: path.join(__filename, '..', '..', '..', 'resources', 'light',
			false ? 'monitor.connected.svg' : 'monitor.svg'),
		dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'monitor.svg')
	};


	get isConnected(): boolean {
		return this.serverItem.isConnected();
	}

}

export class EnvSection {
	serverItemParent: any;
	label: string | vscode.QuickPickItem;
}