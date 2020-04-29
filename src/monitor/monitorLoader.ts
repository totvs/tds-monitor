import { languageClient } from '../extension';
import * as vscode from "vscode";
import * as path from "path";
import { MonitorPanelAction, IMonitorPanelAction } from "./actions";
import { isNullOrUndefined } from "util";
import IMonitorUser from "./monitorUser";

import { IMonitorItem } from '../monitorInterfaces';

const DEFAULT_SPEED = 10;

let monitorLoader: MonitorLoader = undefined;

function updateMonitorPanel() {
  if (isNullOrUndefined(monitorLoader)) {
    monitorLoader = new MonitorLoader();
  } else {
    monitorLoader.reveal();
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
  private _speed: number = 10;
  private _lock: boolean = false;
  private _timeoutSched: any = undefined;

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
      if (this._timeoutSched) {
        clearTimeout(this._timeoutSched);
      }
      monitorLoader = undefined;
      this._isDisposed = true;
    });

    this.speed = DEFAULT_SPEED;
  }

  public reveal() {
    if (!this._isDisposed) {
      this._panel.reveal();
    }
  }

  public set speed(v: number) {
    this._speed = v;
    if (this._speed === 0)
      {
        vscode.window.showInformationMessage("A atualização ocorrerá por solicitação.");
      } else {
        vscode.window.showInformationMessage(`A atualização ocorrerá a cada ${this._speed} segundos.`);
      }
      this._panel.webview.postMessage({
        command: MonitorPanelAction._SetSpeedUpdate,
        data: v
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
    this.updateUsers(true);
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
      case MonitorPanelAction._SetSpeedUpdate: {
        this.speed = command.content.speed;
        break;
      }
      case MonitorPanelAction.UpdateUsers: {
        this.speed = this._speed;
        this.updateUsers(true);

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

        this.updateUsers(false);

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
        console.log("***** ATENÇÃO: monitorLoader.tsx");
        console.log("\tComando não reconhecido: " + command.action);
        console.log("\t" + command.content);
        break;
    }
  }

  public updateUsers(scheduler: boolean) {
    let promises = [];
    let result = [];

    this._serverList.forEach((server) => {
      promises.push(server.getUsers());
    });

    Promise.all(promises)
      .then((promise) => {
        promise.forEach((server) => {
          server.forEach(user => {
            result.push(user);
          });
        });

        return result;
      }).then((users) => {
        this._panel.webview.postMessage({
          command: MonitorPanelAction.UpdateUsers,
          data: users
        });

        return users;
      }).then((users) => {
        if (this.writeLogServer) {
          this.doWriteLogServer(users);
        }
        return users;
      }).finally(() => {
        if (scheduler) {
          if (this._speed > 0) {
            this._timeoutSched = setTimeout(updateScheduledUsers, this._speed * 1000, this, true);
          }
        }
      });
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
        "monitorPanel.js"
      )
    );

    const reactAppUri = this._panel?.webview.asWebviewUri(reactAppPathOnDisk);
    const configJson = JSON.stringify({ serverList: serverList, speed: this._speed });
console.log(vscode.ThemeColor.name);
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

function updateScheduledUsers(monitor: MonitorLoader, scheduler: boolean) {
  vscode.window.showInformationMessage("Monitor atualizado.");
  monitor.updateUsers(scheduler);
}
