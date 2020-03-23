import * as vscode from 'vscode';
import { IMonitorItem } from '../monitorInterfaces';

export class MonitorItem implements IMonitorItem {
	id: string = "";
	type: string = "protheus";
	name: string = "";
	port: number = 0;
	address: string = "";
	buildVersion: string = "";
	secure: boolean = false;
	includes: string[] = [];
	environments: string[] = [];
	smartClient?: string = "";
	token: string = "";
	environment: string = "";

	connect(): Promise<boolean> {
		throw new Error("Method not implemented.");
	}
	reconnect(): Promise<boolean> {
		throw new Error("Method not implemented.");
	}
	validConnection(): Promise<boolean> {
		throw new Error("Method not implemented.");
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