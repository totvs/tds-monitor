import { IMonitorItem } from './monitorInterfaces';
import { serverManager } from './model/monitorManager';
import { TreeMonitorItem } from './model/monitorItem';
import * as vscode from 'vscode';
import { addServerLoader } from './addServer/addServerLoader';
import { toggleServerToMonitor } from './monitor/createMonitorLoader';

export class ServerCommands {

    static register(context: vscode.ExtensionContext): any {
        let disposable = context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.create', () => { ServerCommands.createMonitor(context); }));

        context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.delete', (item: TreeMonitorItem) => { ServerCommands.deleteMonitor(item); }));
        context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.toggle', (item: TreeMonitorItem) => { ServerCommands.toggleMonitor(item); }));

        context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.open.configuration', () => ServerCommands.openConfiguration(context)));

        //Comando para renomear item da visão de monitor.
        //context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.rename', (serverItem: MonitorItem) => renameMonitor(serverItem)));
        //Comando para mostrar todas as informações do servidor selecionado.
        //context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.showInfos', (serverItem: MonitorItem) => showInfos(panelInfos, context, serverItem)))

        return disposable;
    }

    private static createMonitor(context: vscode.ExtensionContext) {
        const server = serverManager.createMonitorTreeItem();
        addServerLoader(server.serverItem, context.extensionPath);
    }

    private static deleteMonitor(monitorItem: TreeMonitorItem) {
        serverManager.delete(monitorItem.serverItem);
    }

    private static openConfiguration(context: vscode.ExtensionContext) {
        const filename = serverManager.getFilename();
        vscode.window.showTextDocument(vscode.Uri.file(filename));
    }

    private static toggleMonitor(monitorItem: TreeMonitorItem) {
        let server: IMonitorItem = monitorItem.serverItem as IMonitorItem;

        if (!server.isConnected()) {
            server.connect().then(
                (value) => {
                    vscode.window.showInformationMessage("Conexão efetuada.");
                    return value;
                }).then((value) => {
                    if (value && server.secure) {
                        vscode.window.showInformationMessage("secure.");
                    }
                    toggleServerToMonitor(monitorItem.serverItem);
                }).catch((reason) => {
                    vscode.window.showInformationMessage(reason);
                }).finally(() => {
                    vscode.window.showInformationMessage("refresh");
                }
                );
        } else {
            toggleServerToMonitor(monitorItem.serverItem);
        }
    }

}