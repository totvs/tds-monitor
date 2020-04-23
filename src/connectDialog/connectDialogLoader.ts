import * as vscode from "vscode";
import * as path from "path";

import { IMonitorItem } from "../monitorInterfaces";
import { IConnectDialogAction, ConnectDialogAction } from "./action";

export function connectDialogLoader(server: IMonitorItem) {
  // tslint:disable-next-line: no-unused-expression
  new ConnectDialogLoader(server);
}

class ConnectDialogLoader {
  protected readonly _panel: vscode.WebviewPanel | undefined;
  private readonly _extensionPath: string;
  private _disposables: vscode.Disposable[] = [];
  private _server: IMonitorItem;

  constructor(newServer: IMonitorItem) {
    const ext = vscode.extensions.getExtension("TOTVS.tds-monitor");
    this._extensionPath = ext.extensionPath;
    this._server = newServer;

    if (newServer) {
      this._panel = vscode.window.createWebviewPanel(
        "ConnectDialogLoader",
        "Identifique-se",
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
      this._panel.webview.html = this.getWebviewContent(newServer);

      this._panel.webview.onDidReceiveMessage(
        (command: IConnectDialogAction) => {
          this.handleMessage(command);
        },
        undefined,
        this._disposables
      );
    }
  }

  private handleMessage(command: IConnectDialogAction) {

    switch (command.action) {
      case ConnectDialogAction.UpdateModel:
        this.updateModel(command.content);
        break;
      case ConnectDialogAction.Close:
        this._panel.dispose();
        break;
      case ConnectDialogAction.SaveAndClose:

        this._panel.dispose();
        break;
    }
  }

  private updateModel(content: any) {
    let needUpdate: boolean = false;

    const p = this._server.updateProperties(content);
    p.then((update) => {
      needUpdate = update;
      if ((needUpdate)) {
        if (this._server.username !== "") {
          this._server.authenticate().then((result) => {
            if (result) {
              vscode.window.showInformationMessage("Autenticação de usuário efetuada com sucesso.")
              needUpdate =false;
              this.closePanel();
            }
          });
        }
      }
    }).catch((r) => {
      vscode.window.showErrorMessage(r);
      console.log(r);
    }).finally(() => {
      if (needUpdate) {
        this.updatePanel();
      }
    });
  }

  private getWebviewContent(monitorItem: IMonitorItem): string {
    // Local path to main script run in the webview
    const reactAppPathOnDisk = vscode.Uri.file(
      path.join(
        this._extensionPath,
        "out",
        "webpack",
        "ConnectDialog.js"
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
      command: ConnectDialogAction.UpdateWeb,
      data: this._server
    });
  }

  private closePanel(): void {
    this._panel?.webview.postMessage({
      command: ConnectDialogAction.Close,
      data: this._server
    });
  }

}
