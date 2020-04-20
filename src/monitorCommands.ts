import { IMonitorItem } from './monitorInterfaces';
import { serverManager } from './model/monitorManager';
import { TreeMonitorItem } from './model/monitorItem';
import * as vscode from 'vscode';
import { addServerLoader } from './addServer/addServerLoader';
import { toggleServerToMonitor } from './monitor/createMonitorLoader';
import { connectDialogLoader } from './connectDialog/connectDialogLoader';

export class ServerCommands {

    static register(context: vscode.ExtensionContext): any {
        let disposable = context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.create', () => { ServerCommands.createMonitor(context); }));

        context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.delete', (item: TreeMonitorItem) => { ServerCommands.deleteMonitor(item); }));
        context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.toggle', (item: TreeMonitorItem) => { ServerCommands.toggleMonitor(context, item); }));

        context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.open.configuration', () => ServerCommands.openConfiguration(context)));
        context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.show-connect-dialog', async (serverItem: IMonitorItem) => await ServerCommands.openConnectDialog(serverItem)));

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

    private static toggleMonitor(context: vscode.ExtensionContext, monitorItem: TreeMonitorItem) {
        let server: IMonitorItem = monitorItem.serverItem as IMonitorItem;
        const disposables: vscode.Disposable[] = [];
        const status = (message: string): void => {
            disposables.push(vscode.window.setStatusBarMessage(message, 5000));
        };

        if (!server.isConnected()) {
            status(`Tentando reconexão: ${server.name}`);

            server
                .reconnect()
                .then(
                    (value) => {
                        vscode.window.showInformationMessage("Reconexão efetuada.");
                    }, (reason) => {
                        status(`Tentando conexão: ${server.name}`);

                        if (reason['code'] === 4081) {
                            server.connect().then(
                                (value) => {
                                    vscode.window.showInformationMessage("Conexão efetuada.");
                                    return value;
                                }).then((value: any) => {
                                    if (value && server.needAuthentication) {
                                        status(`Solicitando credencias: ${server.name}`);
                                        vscode.commands.executeCommand('tds-monitor.show-connect-dialog', server);
                                    } else {
                                        status(`Iniciando monitoramento: ${server.name}`);
                                        toggleServerToMonitor(monitorItem.serverItem);
                                    }
                                }).catch((reason) => {
                                    if (reason['code'] === 4081) {
                                        status(`Solicitando credencias: ${server.name}`);
                                    }
                                });
                        } else {
                            console.log(reason);
                        }
                    }).finally(() => {
                        vscode.window.showInformationMessage("refresh");
                    })
                .finally(() => {
                    //disposables.forEach((d) => {d});
                });
        } else {
            toggleServerToMonitor(monitorItem.serverItem);
        }
    }

}