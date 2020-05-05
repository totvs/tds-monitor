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
  "tds.webview.newServer.environment": localize("tds.webview.newServer.environment", "Initial connection environment")
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
        if (message.serverName && message.port && message.address && message.environment) {
          this.validade({
            name: message.serverName,
            port: message.port,
            address: message.address,
            environment: message.environment
          });
        } else {
          vscode.window.showErrorMessage(localize("tds.webview.serversView.addServerFail", "Add Server Fail. Name, port, address and environment are need"));
        }

        if (message.close) {
          if (this._panel) {
            this._panel.dispose();
          }
        }
    }
  }

  private validade(content: any) {
    this._server.updateProperties(content)
      .then((update: boolean) => {
        if (this._server.errors.length === 0) {
          this._server.validConnection().then((result) => {
            if (!result) {
              this._server.buildVersion = "";
              this._server.secure = false;
            }
          }).then(() => {
            this._server.connect().then((result) => {
              if (result) {
                serverManager.add(this._server);
              }
            }, (reason) => { vscode.window.showErrorMessage(reason); });
          }).finally(() => {
            this.updatePanel();
          });
        }
      }).finally(() => {
        this.updatePanel();
      });
  }

  private getWebViewContent(localizeHTML) {
    const cssContent = addServerCss();
    const htmlContent = addServerHtml({ localize: localizeHTML, css: cssContent });

    let runTemplate = compile(htmlContent);

    return runTemplate({ css: cssContent, localize: localizeHTML });
  }

  private updatePanel(): void {
    this._panel?.webview.postMessage({
      command: AddServerAction.UpdateWeb,
      data: this._server
    });
  }
}
