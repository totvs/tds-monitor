import { serverManager } from './monitorManager';
import * as vscode from 'vscode';
import { IMonitorItem } from '../monitorInterfaces';
import { TreeMonitorItem } from './monitorItem';

export class MonitorItemProvider implements vscode.TreeDataProvider<TreeMonitorItem> {

	private _onDidChangeTreeData: vscode.EventEmitter<TreeMonitorItem | undefined> = new vscode.EventEmitter<TreeMonitorItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<TreeMonitorItem | undefined> = this._onDidChangeTreeData.event;

	public localMonitorItems: Array<TreeMonitorItem> = [];

	constructor() {
		this.loadAndConfigMonitor();
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: TreeMonitorItem): vscode.TreeItem {

		return element;
	}

	getChildren(element?: TreeMonitorItem): Thenable<TreeMonitorItem[]> {
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
		this.loadMonitorItems();

		serverManager.onDidSelectedServer((server: IMonitorItem | null) => {
			this.refresh();
		});

		serverManager.onDidRefreshServerManager(() => {
			this.loadMonitorItems();
			this.refresh();
		});
	}

	private loadMonitorItems() {
		this.localMonitorItems = new Array<TreeMonitorItem>();
		serverManager.getServers().forEach((element: IMonitorItem) => {
			this.localMonitorItems.push(new TreeMonitorItem(element));
		});
	}
}