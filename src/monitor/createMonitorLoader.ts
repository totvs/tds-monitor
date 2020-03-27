import { languageClient } from './../extension';
import * as vscode from "vscode";
import * as path from "path";
import { MonitorViewAction, IMonitorViewAction } from "./actions";
import { isNullOrUndefined } from "util";
import IMonitorUser from "./monitorUser";
import Utils, { SelectServer } from '../utils';
import { IMonitorItem } from '../monitorInterfaces';

let monitorView: CreateMonitorLoader = undefined;

export function updateMonitorView() {
  if (isNullOrUndefined(monitorView)) {
    monitorView = new CreateMonitorLoader();
  }
}

export function toggleServerToMonitor(server: IMonitorItem) {
  updateMonitorView();

  monitorView.toggleServerToMonitor(server);
}

export class CreateMonitorLoader {
  protected readonly _panel: vscode.WebviewPanel | undefined;
  private readonly _extensionPath: string;
  private _disposables: vscode.Disposable[] = [];
  private _isDisposed: boolean = false;
  private _serverList: IMonitorItem[] = Array<IMonitorItem>();
  private _speed: number = 0;
  private _lock: boolean = false;

  public set speed(v: number) {
    this._speed = v;

    this._panel.webview.postMessage({
      command: MonitorViewAction.SetSpeedUpdate,
      data: this._speed
    });

  }

  public set writeLogServer(v: boolean) {
    //this._writeLogServer = v;
  }

  public set lock(v: boolean) {
    this._lock = v;

    this._panel.webview.postMessage({
      command: MonitorViewAction.LockServer,
      data: this._lock
    });

  }

  public toggleServerToMonitor(serverItem: IMonitorItem) { /*TreeItem*/

    const server2 = Utils.getCurrentServer();
    const server = Utils.getServerById(server2.id);

    //let pos = this._serverList.indexOf(server2);

    this._serverList = Array<IMonitorItem>();
    this._serverList.push(server2);

    this._panel.webview.postMessage({
      command: MonitorViewAction.ToggleServer,
      data: this._serverList,
      current: server2,
      server: server
    });

    this.updateUsers(server2);
  }

  constructor() {
    const ext = vscode.extensions.getExtension("TOTVS.tds-monitor");
    this._extensionPath = ext.extensionPath;

    this._disposables.push(Utils.onDidSelectedServer((newServer: SelectServer) => {
      toggleServerToMonitor(undefined);
    }));


    this._panel = vscode.window.createWebviewPanel(
      "createMonitorView",
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

    this._panel.webview.html = this.getWebviewContent();

    this._panel.onDidDispose((event) => {
      monitorView = undefined;
      this._isDisposed = true;
    });

    this._panel.webview.onDidReceiveMessage(
      (command: IMonitorViewAction) => {
        this.handleMessage(command);
      },
      undefined,
      this._disposables
    );
  }

  public reveal() {
    if (!this._isDisposed) {
      this._panel.reveal();
    }
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

  private async handleMessage(command: IMonitorViewAction) {
    switch (command.action) {
      case MonitorViewAction.SetSpeedUpdate: {
        this.speed = command.content.speed;
        break;
      }
      case MonitorViewAction.UpdateUsers: {
        this.updateUsers(command.content);
        this.speed = this._speed; //força a ligar o intervalo (setInterval), se necessário

        break;
      }
      case MonitorViewAction.LockServer: {
        const result = await this.setLockServer(command.content.server, command.content.lock);
        this.lock = result;

        break;
      }
      case MonitorViewAction.SendMessage: {
        this.sendMessage(command.content.server, command.content.recipients, command.content.message);
        break;
      }
      case MonitorViewAction.KillConnection: {
        if (command.content.killNow) {
          this.appKillConnection(command.content.server, command.content.recipients);
        } else {
          this.killConnection(command.content.server, command.content.recipients);
        }

        this.updateUsers(command.content.server);

        break;
      }
      case MonitorViewAction.StopServer: {
        const server = command.content.server;
        this.stopServer(server);

        break;
      }
      case MonitorViewAction.ToggleWriteLogServer: {
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
      command: MonitorViewAction.UpdateUsers,
      data: users
    });

    if (this.writeLogServer) {
      this.doWriteLogServer(users);
    }
  }

  doWriteLogServer(users: IMonitorUser[]) {
    throw new Error("Method not implemented.");
  }

  private getWebviewContent(): string {
    // Local path to main script run in the webview
    const reactAppPathOnDisk = vscode.Uri.file(
      path.join(
        this._extensionPath,
        "out",
        "webpack",
        "monitorView.js"
      )
    );

    const reactAppUri = reactAppPathOnDisk.with({ scheme: "vscode-resource" });

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
        </script>
    </head>
    <body>
        <div id="root"></div>
        <script crossorigin src="${reactAppUri}"></script>
    </body>
    </html>`;
  }
}
