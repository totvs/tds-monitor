import * as vscode from "vscode";
import * as path from "path";

import { IMonitorItem } from "../monitorInterfaces";
import { IAddServerAction, AddServerAction } from "./action";

export class AddServerLoader {
  protected readonly _panel: vscode.WebviewPanel | undefined;
  private readonly _extensionPath: string;
  private _disposables: vscode.Disposable[] = [];
  private _server: IMonitorItem;
  private _needUpdate: boolean = false;

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
          switch (command.action) {
            case AddServerAction.UpdateModel:
              this._needUpdate = this._server.doUpdateProperties(command.content);
              break;

            // case WizardAction.Save:
            //   //this.saveFileContent(command.content);
            //   break;

            // case CommandAction.ValidConnection:
            //   this.doUpdateProperties(newServer, command.content);
            //   this.doValidConnection(newServer);
            //   break;

            // case CommandAction.UpdateProperty:
            //   this.doUpdateProperty(newServer, command.content);

            //   break;
          }

          this.updatePanel();
          this._server.validate().then(
            () => {
              this._needUpdate = true;
            }, (reason: any) => {
              vscode.window.showErrorMessage(reason);
              this._needUpdate = true;
            }).finally(() => {
              this.updatePanel();
            });
        },
        undefined,
        this._disposables
      );
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

  private updatePanel() {
    if (this._needUpdate) {
      this._panel?.webview.postMessage({
        command: AddServerAction.UpdateWeb,
        data: this._server
      });

      this._needUpdate = false;
    }
  }
}
