import { IMonitorItem } from './monitorInterfaces';
import { serverManager } from './model/monitorManager';
import { TreeMonitorItem } from './model/monitorItem';
import * as vscode from 'vscode';
import { addServerLoader } from './addServer/addServerLoader';
import { toggleServerToMonitor } from './monitor/monitorLoader';
import { connectDialogLoader } from './connectDialog/connectDialogLoader';

export class ServerCommands {

    static register(context: vscode.ExtensionContext): any {
        let disposable = context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.create', () => { ServerCommands.createMonitor(context); }));

        context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.delete', (item: TreeMonitorItem) => { ServerCommands.deleteMonitor(item); }));
        context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.toggle', (item: TreeMonitorItem) => { ServerCommands.toggleMonitor(item.serverItem); }));
        context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.add-server-monitor', (serverItem: IMonitorItem) => { ServerCommands.toggleMonitor(serverItem); }));

        context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.open.configuration', () => ServerCommands.openConfiguration(context)));
        context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.show-connect-dialog', async (serverItem: IMonitorItem) => ServerCommands.openConnectDialog(serverItem)));

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

    private static openConnectDialog(serverItem: IMonitorItem) {
        const server: IMonitorItem = serverItem as IMonitorItem;
        connectDialogLoader(server);
    }

    private static toggleMonitor(monitorItem: IMonitorItem) {
        let server: IMonitorItem = monitorItem;

        if (!server.isConnected()) {
            server
                .reconnect()
                .then(
                    (value) => {
                        vscode.window.showInformationMessage("Reconexão efetuada.");
                    }, (reason) => {
                        if (reason['code'] === 4081) {
                            server.connect().then(
                                (value) => {
                                    vscode.window.showInformationMessage("Conexão efetuada.");
                                    return value;
                                }).then((value: any) => {
                                    if (value && server.needAuthentication) {
                                        vscode.commands.executeCommand('tds-monitor.show-connect-dialog', server);
                                    } else {
                                        vscode.commands.executeCommand('tds-monitor.add-server-monitor', server);
                                    }
                                }).catch((reason) => {
                                });
                        } else {
                            console.log(reason);
                            vscode.window.showErrorMessage(reason);
                        }
                    });
        } else {
            toggleServerToMonitor(server);
        }
    }

}