import { serverManager } from './../model/monitorManager';
import * as vscode from "vscode";
import * as path from "path";
import { WelcomePageAction, IWelcomePageAction } from "./actions";
import { IMonitorItem } from '../monitorInterfaces';
import MonitorConfiguration from '../monitorConfiguration';

export function showWelcomePage(forcedShow: boolean = false) {
  let isShowWelcomePage = MonitorConfiguration.isShowWelcomePage();

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
    MonitorConfiguration.setShowWelcomePage(show);
  }

  private isShowWelcomePage(): boolean {
    return MonitorConfiguration.isShowWelcomePage();
  }

  private getServerJsonLocation(): string {
    return MonitorConfiguration.getServerJsonLocation();
  }

  private setServerJsonLocation(value: string) {
    return MonitorConfiguration.setServerJsonLocation(value);
  }

  private getOptionsLocation(): any {
    return MonitorConfiguration.getOptionsLocation();
  }

  private async handleMessage(command: IWelcomePageAction) {
    switch (command.action) {
      case WelcomePageAction.Save: {
        const content = command.content;

        this.setShowWelcomePage(content.showWelcomePage);
        this.setServerJsonLocation(content.serverJsonLocation);

        break;
      }
      case WelcomePageAction.ExecuteCommand: {
        if (command.arg) {
          const server = serverManager.getServerByName(command.arg);
          vscode.commands.executeCommand(command.content, server);
        } else {
          vscode.commands.executeCommand(command.content);
        }
        break;
      }
      default:
        console.log("***** ATENÇÃO: welcomePageLoader.tsx");
        console.log("\tComando não reconhecido: " + command.action);
        console.log("\t" + command.content);
        break;
    }
  }

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

    const serverList: string[] = serverManager.getServers()
      .map((element: IMonitorItem) => {
        return element.name;
      }).sort((a: string, b: string) => {
        return a.localeCompare(b);
      }
      );

    const reactAppUri = reactAppPathOnDisk.with({ scheme: "vscode-resource" });
    const initialData = JSON.stringify(
      {
        showWelcomePage: this.isShowWelcomePage(),
        serverJsonLocation: this.getServerJsonLocation(),
        optionsLocation: this.getOptionsLocation(),
        serverList: serverList
      });

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome Page</title>

        <meta http-equiv="Content-Security-Policy"
                    content="default-src 'self';
                             img-src 'self' vscode-resource: data:;
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
