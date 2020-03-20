import * as vscode from 'vscode';
import { MonitorItemProvider } from '../model/monitorItemProvider';

const treeDataProvider = new MonitorItemProvider();

export class MonitorsExplorer {

	constructor() {
		vscode.window.createTreeView('totvs_monitor', { treeDataProvider });
		vscode.window.registerTreeDataProvider('totvs_monitor', treeDataProvider);
	}

}


