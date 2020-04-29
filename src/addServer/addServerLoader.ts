import { serverManager } from './../model/monitorManager';
import * as vscode from "vscode";
import * as path from "path";
import * as nls from "vscode-nls";

import { IMonitorItem } from "../monitorInterfaces";
import { IAddServerAction, AddServerAction } from "./action";
import { addServerHtml, addServerCss } from './addServerPage';

export function addServerLoader(newServer: IMonitorItem, extensionPath: string) {
  // tslint:disable-next-line: no-unused-expression
  new AddServerLoader(newServer, extensionPath);
}

let localize = nls.loadMessageBundle();
const compile = require('template-literal');

const localizeHTML = {
  "tds.webview.newServer.title": localize("tds.webview.newServer.title", "New Server"),
  "tds.webview.newServer.name": localize("tds.webview.newServer.name", "Server Name"),
  "tds.webview.newServer.address": localize("tds.webview.newServer.address", "Address"),
  "tds.webview.newServer.port": localize("tds.webview.newServer.port", "Port"),
  "tds.webview.newServer.save": localize("tds.webview.newServer.save", "Save"),
  "tds.webview.newServer.saveClose": localize("tds.webview.newServer.saveClose", "Save/Close"),
  "tds.webview.newServer.secure": localize("tds.webview.newServer.secure", "Secure(SSL)"),
  "tds.webview.dir.include": localize("tds.webview.dir.include", "Includes directory"),
  "tds.webview.dir.include2": localize("tds.webview.dir.include2", "Allow multiple directories")
};

class AddServerLoader {
  protected readonly _panel: vscode.WebviewPanel | undefined;
  private _disposables: vscode.Disposable[] = [];
  private _server: IMonitorItem;

  constructor(newServer: IMonitorItem, extensionPath: string) {
    this._server = newServer;

    if (newServer) {
      this._panel = vscode.window.createWebviewPanel(
        "addServerLoader",
        "Assistente: Novo Servidor",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.file(
              path.join(extensionPath, "out", "webpack")
            )
          ]
        }
      );

      //this._panel.webview.html = this.getWebviewContent(newServer);
      this._panel.webview.html = this.getWebViewContent(localizeHTML);

      this._panel.webview.onDidReceiveMessage(
        (command: IAddServerAction) => {
          this.handleMessage(command);
        },
        undefined,
        this._disposables
      );
    }
  }

  private handleMessage(message: any) {
    // command: 'saveServer',
    // 	address: addressID,
    // 	serverName: serverNameID,
    // 	port: portID,
    // 	'close': close,
    //   includes: includePath

    switch (message.command) {
      case 'saveServer':
        if (message.serverName && message.port && message.address) {
          this.validade({
            name: message.serverName,
            port: message.port,
            address: message.address

            // needAuthentication: any;
            // reconnectToken: any;
            // parent: string;
            // id: string;
            // buildVersion: string;
            // secure: boolean;
            // includes: string[];
            // environments: string[];
            // smartClient: string;
            // token: string;
            // environment: string;
            // errors: IError[];
            // username: string;
            // password: string;
          });
          serverManager.add(this._server);
        } else {
          vscode.window.showErrorMessage(localize("tds.webview.serversView.addServerFail", "Add Server Fail. Name, port and Address are need"));
        }

        if (message.close) {
          if (this._panel) {
            this._panel.dispose();
          }
        }

      // switch (command.action) {
      //   case AddServerAction.UpdateModel:
      //     this.updateModel(command.content);
      //     break;
      //   case AddServerAction.Validate:
      //     this.validade(command.content);
      //     break;
      //   case AddServerAction.SelectSmartClient:
      //     this.selectSmartClient(command.content);
      //     break;
      //   case AddServerAction.Close:
      //     this._panel.dispose();
      //     break;
      //   case AddServerAction.SaveAndClose:
      //     serverManager.add(this._server);
      //     this._panel.dispose();
      //     break;
      // }
    }
  }

  // private selectSmartClient(smartClientPath: string) {
  //   let openDialogOptions: vscode.OpenDialogOptions = {
  //     canSelectFiles: true,
  //     canSelectFolders: false,
  //     canSelectMany: false,
  //     openLabel: "Aplicação SmartClient",
  //     defaultUri: vscode.Uri.parse("file:///" + smartClientPath),
  //     filters: {
  //       SmartClient: ["exe"],
  //       AllFiles: ["*"]
  //     }
  //   };

  //   vscode.window
  //     .showOpenDialog(openDialogOptions)
  //     .then(async (uri: vscode.Uri[] | undefined) => {
  //       if (uri && uri.length > 0) {
  //         this.updateModel({ smartClient: uri[0].fsPath });
  //       } else {
  //         vscode.window.showErrorMessage("No valid SmartClient file selected!");
  //       }
  //     });
  // }


  // private updateModel(content: any) {
  //   let needUpdate: boolean = false;

  //   this._server.updateProperties(content)
  //     .then((update) => {
  //       needUpdate = update;
  //     }).catch((r) => {
  //       console.log(r);
  //     }).finally(() => {
  //       if (needUpdate) {
  //         this.updatePanel();
  //       }
  //     });
  // }

  private validade(content: any) {
    this._server.updateProperties(content)
      .then(async () => {
        if (this._server.errors.length === 0) {
          this._server.validConnection().then((result) => {
            if (!result) {
              this._server.buildVersion = "";
              this._server.secure = false;
            }
          }).finally(() => {
            this.updatePanel();
          });
        }
      }).finally(() => {
        this.updatePanel();
      });
  }

  private getWebViewContent(localizeHTML) {
    //"Cannot read property 'tds.webview.newServer.title' of undefined"
    const cssContent = addServerCss();
    const htmlContent = addServerHtml({ localize: localizeHTML, css: cssContent });

    let runTemplate = compile(htmlContent);

    return runTemplate({ css: cssContent, localize: localizeHTML });
  }

  // private _getWebviewContent(monitorItem: IMonitorItem): string {
  //   // Local path to main script run in the webview
  //   const reactAppPathOnDisk = vscode.Uri.file(
  //     path.join(
  //       this._extensionPath,
  //       "out",
  //       "webpack",
  //       "addServer.js"
  //     )
  //   );
  //   const reactAppUri = this._panel?.webview.asWebviewUri(reactAppPathOnDisk);
  //   const configJson = JSON.stringify(monitorItem);

  //   return `<!DOCTYPE html>
  //   <html lang="en">
  //   <head>
  //       <meta charset="UTF-8">
  //       <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //       <title>Config View</title>

  //       <meta http-equiv="Content-Security-Policy"
  //                   content="default-src 'none';
  //                            img-src https:;
  //                            script-src 'unsafe-eval' 'unsafe-inline' vscode-resource:;
  //                            style-src vscode-resource: 'unsafe-inline';">
  //       <script>
  //         window.acquireVsCodeApi = acquireVsCodeApi;
  //         window.initialData = ${configJson};
  //       </script>
  //   </head>
  //   <body>
  //       <div id="root"></div>

  //       <script crossorigin src="${reactAppUri}"></script>
  //   </body>
  //   </html>`;
  // }

  private updatePanel(): void {
    this._panel?.webview.postMessage({
      command: AddServerAction.UpdateWeb,
      data: this._server
    });
  }
}
