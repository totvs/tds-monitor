import { languageClient } from '../extension';
import * as vscode from "vscode";
import * as path from "path";
import { MonitorPanelAction, IMonitorPanelAction } from "./actions";
import { isNullOrUndefined } from "util";
import IMonitorUser from "./monitorUser";

import { IMonitorItem } from '../monitorInterfaces';

let monitorLoader: MonitorLoader = undefined;

export function updateMonitorPanel() {
  if (isNullOrUndefined(monitorLoader)) {
    monitorLoader = new MonitorLoader();
  }
}

export function toggleServerToMonitor(server: IMonitorItem) {
  updateMonitorPanel();

  monitorLoader.toggleServerToMonitor(server);
}

export class MonitorLoader {
  protected readonly _panel: vscode.WebviewPanel | undefined;
  private readonly _extensionPath: string;
  private _disposables: vscode.Disposable[] = [];
  private _isDisposed: boolean = false;
  private _serverList: IMonitorItem[] = Array<IMonitorItem>();
  private _speed: number = 0;
  private _lock: boolean = false;

  constructor() {
    const ext = vscode.extensions.getExtension("TOTVS.tds-monitor");
    this._extensionPath = ext.extensionPath;

    // this._disposables.push(Utils.onDidSelectedServer((newServer: SelectServer) => {
    //   toggleServerToMonitor(undefined);
    // }));

    this._panel = vscode.window.createWebviewPanel(
      "monitorLoader",
      "Monitor",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.file(
            path.join(this._extensionPath, "out", "webpack")
          )
        ]
      }
    );

    this._panel.iconPath = {
      light: vscode.Uri.parse(path.join("file:///", __filename, '..', '..', '..', 'resources', 'light', 'lock.svg')),
      dark: vscode.Uri.parse(path.join("file:///", __filename, '..', '..', '..', 'resources', 'dark', 'lock.svg'))
    };
    this._panel.webview.html = this.getWebviewContent(this._serverList);

    this._panel.webview.onDidReceiveMessage(
      (command: IMonitorPanelAction) => {
        this.handleMessage(command);
      },
      undefined,
      this._disposables
    );

    this._panel.onDidDispose((event) => {
      monitorLoader = undefined;
      this._isDisposed = true;
    });
  }

  public reveal() {
    if (!this._isDisposed) {
      this._panel.reveal();
    }
  }

  public set speed(v: number) {
    this._speed = v;

    this._panel.webview.postMessage({
      command: MonitorPanelAction.SetSpeedUpdate,
      data: this._speed
    });

  }

  public set writeLogServer(v: boolean) {
    //this._writeLogServer = v;
  }

  public set lock(v: boolean) {
    this._lock = v;

    this._panel.webview.postMessage({
      command: MonitorPanelAction.LockServer,
      data: this._lock
    });

  }

  public toggleServerToMonitor(serverItem: IMonitorItem) { /*TreeItem*/

    //let pos = this._serverList.indexOf(serverItem);

    this._serverList = Array<IMonitorItem>();
    this._serverList.push(serverItem);

    this._panel.webview.postMessage({
      command: MonitorPanelAction.ToggleServer,
      data: this._serverList,
      current: serverItem,
      server: serverItem
    });

    this.updateUsers(serverItem);
  }

  private async setLockServer(server: IMonitorItem, lock: boolean): Promise<boolean> {
    return languageClient
      .sendRequest('$totvsmonitor/setConnectionStatus', {
        setConnectionStatusInfo: {
          connectionToken: server.token,
          status: lock
        }
      })
      .then((response: any) => {
        return response.message === "OK";
      },
        ((error: Error) => {
          return null;
        })
      );
  }

  private async stopServer(server: IMonitorItem): Promise<boolean> {
    return languageClient
      .sendRequest('$totvsmonitor/stopServer', {
        stopServerInfo: {
          connectionToken: server.token
        }
      })
      .then((response: any) => {
        return response.message === "OK";
      },
        ((error: Error) => {
          return null;
        })
      );
  }


  private killConnection(server: IMonitorItem, recipients: any[]): void {
    recipients.forEach((recipient) => {
      languageClient
        .sendRequest('$totvsmonitor/killUser', {
          killUserInfo: {
            connectionToken: server.token,
            userName: recipient.username,
            computerName: recipient.computerName,
            threadId: recipient.threadId,
            serverName: recipient.server
          }
        })
        .then((response: any) => {
          vscode.window.showInformationMessage(response.message);
        },
          ((error: Error) => {
            vscode.window.showErrorMessage(error.message);
          })
        );
    });
  }

  private appKillConnection(server: IMonitorItem, recipients: any[]): void {
    recipients.forEach((recipient) => {
      languageClient
        .sendRequest('$totvsmonitor/appKillUser', {
          appKillUserInfo: {
            connectionToken: server.token,
            userName: recipient.userServer,
            computerName: recipient.machine,
            threadId: recipient.threadId,
            serverName: recipient.server
          }
        })
        .then((response: any) => {
          vscode.window.showInformationMessage(response.message);
        },
          ((error: Error) => {
            vscode.window.showErrorMessage(error.message);
          })
        );
    });
  }

  private sendMessage(server: IMonitorItem, recipients: any[], message: string): void {
    recipients.forEach((recipient) => {
      languageClient
        .sendRequest('$totvsmonitor/sendUserMessage', {
          sendUserMessageInfo: {
            connectionToken: server.token,
            userName: recipient.username,
            computerName: recipient.machine,
            threadId: recipient.threadId,
            serverName: recipient.server,
            message: message
          }
        })
        .then((response: any) => {
          vscode.window.showInformationMessage(response.message);
        },
          ((error: Error) => {
            vscode.window.showErrorMessage(error.message);
          })
        );
    });
  }

  private async handleMessage(command: IMonitorPanelAction) {
    switch (command.action) {
      case MonitorPanelAction.SetSpeedUpdate: {
        this.speed = command.content.speed;
        break;
      }
      case MonitorPanelAction.UpdateUsers: {
        this.updateUsers(command.content);
        this.speed = this._speed; //força a ligar o intervalo (setInterval), se necessário

        break;
      }
      case MonitorPanelAction.LockServer: {
        const result = await this.setLockServer(command.content.server, command.content.lock);
        this.lock = result;

        break;
      }
      case MonitorPanelAction.SendMessage: {
        this.sendMessage(command.content.server, command.content.recipients, command.content.message);
        break;
      }
      case MonitorPanelAction.KillConnection: {
        if (command.content.killNow) {
          this.appKillConnection(command.content.server, command.content.recipients);
        } else {
          this.killConnection(command.content.server, command.content.recipients);
        }

        this.updateUsers(command.content.server);

        break;
      }
      case MonitorPanelAction.StopServer: {
        const server = command.content.server;
        this.stopServer(server);

        break;
      }
      case MonitorPanelAction.ToggleWriteLogServer: {
        this.writeLogServer = !this.writeLogServer;

        break;
      }
      default:
        console.log("***** ATENÇÃO: createMonitorLoader.tsx");
        console.log("\tComando não reconhecido: " + command.action);
        console.log("\t" + command.content);
        break;
    }
  }

  private async updateUsers(server: any) {
    const users = await languageClient
      .sendRequest('$totvsmonitor/getUsers', {
        getUsersInfo: {
          connectionToken: server.token
        }
      })
      .then((response: any) => {
        return response.mntUsers;
      },
        ((error: Error) => {
          return null;
        })
      );

    this._panel.webview.postMessage({
      command: MonitorPanelAction.UpdateUsers,
      data: users
    });

    if (this.writeLogServer) {
      this.doWriteLogServer(users);
    }
  }

  doWriteLogServer(users: IMonitorUser[]) {
    throw new Error("Method not implemented.");
  }

  private getWebviewContent(serverList: IMonitorItem[]): string {
    // Local path to main script run in the webview
    const reactAppPathOnDisk = vscode.Uri.file(
      path.join(
        this._extensionPath,
        "out",
        "webpack",
        "monitorPapel.js"
      )
    );

    const reactAppUri = this._panel?.webview.asWebviewUri(reactAppPathOnDisk);
    const configJson = JSON.stringify(serverList);

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Monitor View</title>

        <meta http-equiv="Content-Security-Policy"
                    content="default-src 'none';
                             img-src https:;
                             script-src 'unsafe-eval' 'unsafe-inline' vscode-resource:;
                             style-src vscode-resource: 'unsafe-inline';">

        <script>
          window.acquireVsCodeApi = acquireVsCodeApi;
          window.initialData = ${configJson};
        </script>
    </head>
    <body>
        <div id="root"></div>
        <script crossorigin src="${reactAppUri}"></script>
    </body>
    </html>`;
  }
}
