import { serverManager } from './model/monitorManager';
import { MonitorItem, TreeMonitorItem } from './model/monitorItem';
import * as vscode from 'vscode';
import { addServerLoader } from './addServer/addServerLoader';
import { IMonitorItem } from './monitorInterfaces';

export class ServerCommands {

    static register(context: vscode.ExtensionContext): any {
        let disposable = context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.create', () => ServerCommands.createMonitor(context)));

        context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.delete', (monitorItem: MonitorItem) => ServerCommands.deleteMonitor(context, monitorItem)));
        context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.open.configuration', () => ServerCommands.openConfiguration(context)));
		context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.connect', (treeItem: TreeMonitorItem) => ServerCommands.connect(treeItem)));
		context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.disconnect', (treeItem: TreeMonitorItem) => ServerCommands.disconnect(treeItem)));

        //Comando para renomear item da visão de monitor.
        //context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.rename', (serverItem: MonitorItem) => renameMonitor(serverItem)));
        //Comando para mostrar todas as informações do servidor selecionado.
        //context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.showInfos', (serverItem: MonitorItem) => showInfos(panelInfos, context, serverItem)))

        return disposable;
    }

    static disconnect(monitorItem: TreeMonitorItem): any {
        monitorItem.token = "";
    }

    static connect(monitorItem: TreeMonitorItem): any {
        monitorItem.token = "XXXXXXXXXXXX";
        // if (monitorItem.secure) {

        // }

        // //Verifica se ha um buildVersion cadastrado.
        //         inputConnectionParameters(context, serverItem);
    }

    private static createMonitor(context: vscode.ExtensionContext) {
        const server = serverManager.createServerItem();
        addServerLoader(server.serverItem, context.extensionPath);
    }

    private static deleteMonitor(context: vscode.ExtensionContext, monitorItem: MonitorItem) {
        serverManager.delete(monitorItem);
    }

    private static openConfiguration(context: vscode.ExtensionContext) {
        const filename = serverManager.getFilename();
        vscode.window.showTextDocument(vscode.Uri.file(filename));
    }

}