import * as vscode from "vscode";
import * as path from "path";

import { IMonitorItem } from "../monitorInterfaces";
import { IAddServerAction, AddServerAction } from "./action";

export class AddServerLoader {
  protected readonly _panel: vscode.WebviewPanel | undefined;
  private readonly _extensionPath: string;
  private _disposables: vscode.Disposable[] = [];
  private _server: IMonitorItem;

  constructor(newServer: IMonitorItem, extensionPath: string) {
    this._extensionPath = extensionPath;
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

      this._panel.webview.html = this.getWebviewContent(newServer);

      this._panel.webview.onDidReceiveMessage(
        (command: IAddServerAction) => {
          this.handleMessage(command);
        },
        undefined,
        this._disposables
      );
    }
  }

  private handleMessage(command: IAddServerAction) {

    switch (command.action) {
      case AddServerAction.UpdateModel:
        const p = this._server.updateProperties(command.content);
        p.then(async () => {
          if (this._server.errors.length === 0) {
            if (this._server.buildVersion === "" && this._server.address !== "") {
              this._server.validConnection().then((result) => {
                this._server.buildVersion = result.buildVersion;
                this._server.secure = result.secure;
              }).finally(() => {
                this.updatePanel();
              });
            }
          }
        });
        p.then((update) => {
          if (update) {
            this.updatePanel();
          }
        }).catch((r) => {
          console.log(r);
        }).finally(() => {
          console.log("gim");
        });
        break;
    }
  }

  private getWebviewContent(monitorItem: IMonitorItem): string {
    // Local path to main script run in the webview
    const reactAppPathOnDisk = vscode.Uri.file(
      path.join(
        this._extensionPath,
        "out",
        "webpack",
        "addServer.js"
      )
    );
    const reactAppUri = this._panel?.webview.asWebviewUri(reactAppPathOnDisk);
    const configJson = JSON.stringify(monitorItem);

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Config View</title>

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

  private updatePanel(): void {
    this._panel?.webview.postMessage({
      command: AddServerAction.UpdateWeb,
      data: this._server
    });
  }
}
