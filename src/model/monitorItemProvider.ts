import { serverManager } from './monitorManager';
import * as vscode from 'vscode';
import { MonitorItem } from './monitorItem';
import { IMonitorItem } from '../monitorInterfaces';

export class MonitorItemProvider implements vscode.TreeDataProvider<MonitorItem> {

	private _onDidChangeTreeData: vscode.EventEmitter<MonitorItem | undefined> = new vscode.EventEmitter<MonitorItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<MonitorItem | undefined> = this._onDidChangeTreeData.event;

	public localMonitorItems: Array<MonitorItem> = [];

	constructor() {
		this.loadAndConfigMonitor();
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: MonitorItem): vscode.TreeItem {

		return element;
	}

	getChildren(element?: MonitorItem): Thenable<MonitorItem[]> {
		if (element) {
			if (element.listSessions) {
				return Promise.resolve(element.listSessions);
			}
		} else {
			return Promise.resolve(this.localMonitorItems);
		}

		return Promise.resolve([]);
	}

	/**
	 * Cria os itens da arvore de servidores
	 */
	private loadAndConfigMonitor() {
		serverManager.onDidSelectedServer((server: IMonitorItem | null) => {
			this.refresh();
		});

		serverManager.onDidRefreshServerManager(() => {
			this.loadMonitorItems();
			this.refresh();
		});

		this.loadMonitorItems();
	}

	private loadMonitorItems() {
		this.localMonitorItems = new Array<MonitorItem>();
		serverManager.getServers().forEach((element: IMonitorItem) => {
			this.localMonitorItems.push(new MonitorItem(element));
		});
	}
}