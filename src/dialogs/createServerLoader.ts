import * as vscode from "vscode";
import * as path from "path";
import { ICommand, CommandAction } from "./command";
import { IMonitorItem } from "../monitorInterfaces";

export class CreateServerLoader {
  protected readonly _panel: vscode.WebviewPanel | undefined;
  private readonly _extensionPath: string;
  private _disposables: vscode.Disposable[] = [];

  constructor(newServer: IMonitorItem, extensionPath: string) {
    this._extensionPath = extensionPath;

    let config = newServer;
    if (config) {
      this._panel = vscode.window.createWebviewPanel(
        "createServerView",
        "Create ServerView",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.file(
              path.join(extensionPath, "out", "createServerViewer")
            )
          ]
        }
      );

      this._panel.webview.html = this.getWebviewContent(config);

      this._panel.webview.onDidReceiveMessage(
        (command: ICommand) => {
          switch (command.action) {
            case CommandAction._Save:
              //this.saveFileContent(command.content);
              break;

            case CommandAction.ValidConnection:
              this.doUpdateProperties(newServer, command.content);
              this.doValidConnection(newServer);
              break;

            case CommandAction.UpdateProperty:
              this.doUpdateProperty(newServer, command.content);

              break;
          }
          this.updatePanel(config);
        },
        undefined,
        this._disposables
      );
    }
  }

  private getWebviewContent(config: IMonitorItem): string {
    // Local path to main script run in the webview
    const reactAppPathOnDisk = vscode.Uri.file(
      path.join(
        this._extensionPath,
        "out",
        "createServerViewer",
        "createServerViewer.js"
      )
    );
    const reactAppUri = this._panel?.webview.asWebviewUri(reactAppPathOnDisk);
    const configJson = JSON.stringify(config);

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

  private async doValidConnection(config: IMonitorItem) {
    config.validConnection();
  }

  private doUpdateProperties(config: IMonitorItem, content: any) {
    for (const key in content) {
      if (config.hasOwnProperty(key)) {
        this.doUpdateProperty(config, { name: key, content: content[key]});
      }
    }
  }

  private doUpdateProperty(config: any, content: any) {
    if (config.hasOwnProperty(content.name)) {
      config[content.name] = content.value;
    } else {
      console.warn(`doUpdateProperty: not found property ${content.name}`);
    }
  }

  private updatePanel(config: any) {
    this._panel?.webview.postMessage({
      error: config.buildVersion === "" ? "Erro de validação." : "",
      command: CommandAction.UpdateState,
      data: config
    });
  }
}
