import { AddServerLoader } from './wizard/addServer/addServerLoader';
import { serverManager } from './model/monitorManager';
import { MonitorItem } from './model/monitorItem';
import * as vscode from 'vscode';
import { IMonitorItem } from './monitorInterfaces';

export class ServerCommands {

    static register(context: vscode.ExtensionContext): any {
        let disposable = context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.create', () => ServerCommands.createMonitor(context)));
        context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.add', (serverItem: IMonitorItem) => ServerCommands.addMonitor(context, serverItem)));
        context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.delete', (monitorItem: MonitorItem) => ServerCommands.deleteMonitor(context, monitorItem)));
        context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.open.configuration', () => ServerCommands.openConfiguration(context)));

        //Comando para renomear item da visão de monitor.
        //context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.rename', (serverItem: MonitorItem) => renameMonitor(serverItem)));
        //Comando para mostrar todas as informações do servidor selecionado.
        //context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.showInfos', (serverItem: MonitorItem) => showInfos(panelInfos, context, serverItem)))

        return disposable;
    }

    private static createMonitor(context: vscode.ExtensionContext) {
        const server = serverManager.createServerItem();
        const loader = new AddServerLoader(server.serverItem, context.extensionPath);
        console.log(loader);
    }

    private static addMonitor(context: vscode.ExtensionContext, serverItem: IMonitorItem) {
        serverManager.add(serverItem);
    }

    private static deleteMonitor(context: vscode.ExtensionContext, monitorItem: MonitorItem) {
        serverManager.delete(monitorItem);
    }

    private static openConfiguration(context: vscode.ExtensionContext) {
        const filename = serverManager.getFilename();
        vscode.window.showTextDocument(vscode.Uri.file(filename));
    }

}