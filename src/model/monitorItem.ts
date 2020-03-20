import * as vscode from 'vscode';
import { IMonitorItem } from '../monitorInterfaces';

export class MonitorItem extends vscode.TreeItem {

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
		return `${this.serverItem.address}:${this.serverItem.port} (${this.serverItem.type}${this.serverItem.secure?",SSL":""})`;
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