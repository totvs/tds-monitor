import * as vscode from "vscode";
import * as path from "path";
import { WelcomePageAction, IWelcomePageAction } from "./actions";

export function showWelcomePage(forcedShow: boolean = false) {
  const config = vscode.workspace.getConfiguration('tdsMonitor');//transformar em configuracao de workspace
  let isShowWelcomePage = config.get('welcomePage');

  if (isShowWelcomePage || forcedShow) {
    const loader = new WelcomePageLoader();
    console.log(loader);
  }
}

export class WelcomePageLoader {
  protected readonly _panel: vscode.WebviewPanel | undefined;
  private readonly _extensionPath: string;
  private _disposables: vscode.Disposable[] = [];
  private _isDisposed: boolean = false;

  constructor() {
    const ext = vscode.extensions.getExtension("TOTVS.tds-monitor");
    this._extensionPath = ext.extensionPath;

    // this._disposables.push(Utils.onDidSelectedServer((newServer: SelectServer) => {
    //   toggleServerToMonitor(undefined);
    // }));


    this._panel = vscode.window.createWebviewPanel(
      "welcomePage",
      "Bem Vindo!",
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

    // const onDiskPath = vscode.Uri.file(
    //   path.join(this._extensionPath, 'media', 'cat.gif')
    // );
    // const catGifSrc = this._panel.webview.asWebviewUri(onDiskPath);

    this._panel.webview.html = this.getWebviewContent();

    this._panel.onDidDispose((event) => {
      this._isDisposed = true;
    });

    this._panel.webview.onDidReceiveMessage(

      (command: IWelcomePageAction) => {
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

  private setShowWelcomePage(show: boolean): void {
    const config = vscode.workspace.getConfiguration('tdsMonitor');//transformar em configuracao de workspace
    config.update("welcomePage", show);
  }

  private isShowWelcomePage(): boolean {
    const config = vscode.workspace.getConfiguration('tdsMonitor');//transformar em configuracao de workspace
    return config.get("welcomePage", true);
  }

  private getServerJsonLocation(): string {
    const config = vscode.workspace.getConfiguration('tdsMonitor');//transformar em configuracao de workspace
    return config.get("servers.json", "user");
  }

  private setServerJsonLocation(value: string) {
    const config = vscode.workspace.getConfiguration('tdsMonitor');//transformar em configuracao de workspace
    return config.update("servers.json", value);
  }

  private getOptionsLocation(): any {
    const homedir = require("os").homedir();
    const userFile = path.join(homedir, ".totvsls", "servers.json");
    const monitorFile = path.join(homedir, ".totvsls", "monitor.json");
    const workspaceFile = path.join(vscode.workspace.rootPath, ".tds", "monitor.json");

    return { userFile: userFile, monitorFile: monitorFile, workspaceFile: workspaceFile };
  }

  private async handleMessage(command: IWelcomePageAction) {
    switch (command.action) {
      case WelcomePageAction.Save: {
        const content = command.content;

        this.setShowWelcomePage(content.showWelcomePage);
        this.setServerJsonLocation(content.serverJsonLocation);

        break;
      }
      default:
        console.log("***** ATENÇÃO: welcomePageLoader.tsx");
        console.log("\tComando não reconhecido: " + command.action);
        console.log("\t" + command.content);
        break;
    }
  }

  // const userFile = path.join(homedir, ".totvsls", "servers.json");
  // const monitorFile = path.join(homedir, ".totvsls", "monitor.json");
  // const workspaceFile = "./monitor.json";

  private getWebviewContent(): string {
    // Local path to main script run in the webview
    const reactAppPathOnDisk = vscode.Uri.file(
      path.join(
        this._extensionPath,
        "out",
        "webpack",
        "welcomePage.js"
      )
    );

    const reactAppUri = reactAppPathOnDisk.with({ scheme: "vscode-resource" });
    const initialData = JSON.stringify(
      {
        showWelcomePage: this.isShowWelcomePage(),
        serverJsonLocation: this.getServerJsonLocation(),
        optionsLocation: this.getOptionsLocation()
      });

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome Page</title>

        <meta http-equiv="Content-Security-Policy"
                    content="default-src 'none';
                             img-src https:;
                             script-src 'unsafe-eval' 'unsafe-inline' vscode-resource:;
                             style-src vscode-resource: 'unsafe-inline';">

        <script>
          window.acquireVsCodeApi = acquireVsCodeApi;
          window.initialData = ${initialData};
        </script>
    </head>
    <body>
        <div id="root">Loading.....</div>
        <script crossorigin src="${reactAppUri}"></script>
    </body>
    </html>`;
  }
}
