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
          switch (command.action) {
             case AddServerAction.UpdateModel:
              this.doUpdateProperties( command.content);
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

  // private async doValidConnection(config: IMonitorItem) {
  //   config.validConnection();
  // }

   private doUpdateProperties(content: any) {
     for (const key in content) {
       if (this._server.hasOwnProperty(key)) {
        this._server[key] = content[key];
     } else {
       console.warn(`doUpdateProperty: not found property ${content.name}`);
     }
   }
  }

  private updatePanel() {
    this._panel?.webview.postMessage({
      error: this._server.buildVersion === "" ? "Erro de validação." : "",
      command: AddServerAction.UpdateWizard,
      data: this._server
    });
  }
}
