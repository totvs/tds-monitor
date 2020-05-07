import * as vscode from 'vscode';
import { MonitorItemProvider } from '../model/monitorItemProvider';
import { TreeMonitorItem } from '../model/monitorItem';

const treeDataProvider = new MonitorItemProvider();

export class MonitorsExplorer {

	constructor(context: vscode.ExtensionContext) {
		const treeOptions: vscode.TreeViewOptions<TreeMonitorItem> = {
			treeDataProvider: treeDataProvider,
			canSelectMany: false,
			showCollapseAll: true
		};

		vscode.window.createTreeView('tds_monitor', treeOptions);
		vscode.window.registerTreeDataProvider('tds_monitor', treeDataProvider);
	}


}


