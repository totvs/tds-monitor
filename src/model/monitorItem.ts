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
	smartClient?: string = "M:/protheus/19-3-0-3/protheus/smartClient/smartclient.exe";
	token: string = "";
	environment: string = "";
	errors: IError[] = [];

	public updateProperties(content: any): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			return resolve(this.doUpdateProperties(content));
		});
	}

	private doUpdateProperties(content: any): boolean { //JSON format
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
				console.warn(`doUpdateProperty: not found property ${content.name}`);
			}
		}

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

	connect(): Promise<boolean> {
		throw new Error("Method not implemented.");
	}

	reconnect(): Promise<boolean> {
		throw new Error("Method not implemented.");
	}

	public async validConnection(): Promise<any> {
		const lsc = await getLanguageClient();

		const request = await lsc
			.validation(this.address, parseInt("" + this.port))
			.then((value) => {
				return { buildVersion: value.build, secure: value.secure };
			}, (reason) => {
				throw reason;
			})
			.catch(err => {
				return undefined;
			});

		return request;
	}

}

export class TreeMonitorItem extends vscode.TreeItem {

	public isConnected: boolean = false;
	public token: string = "";
	public environment: string = "";
	public listSessions: Array<any /*SessionSection*/> = [];

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

	contextValue = 'monitorItem';
}

export class EnvSection {
	serverItemParent: any;
	label: string | vscode.QuickPickItem;
}