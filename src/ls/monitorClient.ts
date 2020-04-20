import { isNullOrUndefined } from "util";
import * as vscode from "vscode";
import {
  window
} from "vscode";
import {
  LanguageClientOptions,
  RevealOutputChannelOn,
  ServerOptions,
  StateChangeEvent,
  State
} from "vscode-languageclient/lib/main";
import { statSync, chmodSync } from "fs";

import {
  syncSettings,
  getClientConfig
} from "./languageServerSettings";
import { MonitorLanguageClient } from "./monitorLanguageClient";

let advpls: string;
let languageClient: MonitorLanguageClient;

import { WorkspaceConfiguration } from "vscode";
import { Message } from "vscode-jsonrpc";
import { CloseAction, ErrorAction, ErrorHandler } from "vscode-languageclient";

class LsErrorHandler implements ErrorHandler {
  constructor(readonly config: WorkspaceConfiguration) { }

  error(error: Error, message: Message, count: number): ErrorAction {
    window.showErrorMessage(error.message);

    return ErrorAction.Shutdown;
  }

  closed(): CloseAction {
    const notifyOnCrash = this.config.get("launch.notifyOnCrash");
    const restart = this.config.get("launch.autoRestart");

    if (notifyOnCrash) {
      window.showInformationMessage(
        restart
          ? "LS Protheus has crashed; it has been restarted."
          : "LS Protheus has crashed; it has not been restarted."
      );
    }

    if (restart) {
      return CloseAction.Restart;
    }

    return CloseAction.DoNotRestart;
  }
}

export function getLanguageClient(): Promise<MonitorLanguageClient> {
  if (!isNullOrUndefined(languageClient)) {
    if (languageClient.needsStart()) {
      window.showInformationMessage("Iniciando 'manualmente'");
      languageClient.start();
    }

    return Promise.resolve(languageClient);
  }

  let clientConfig: any = getClientConfig();
  let args: any[] = ["--language-server"];
  if (clientConfig["launch.args"]) {
    args[0] = args[0].concat(clientConfig["launch.args"]);
  }

  let env: any = {};
  let kToForward = ["ProgramData", "PATH", "LD_LIBRARY_PATH", "HOME", "USER"];
  for (let e of kToForward) {
    env[e] = process.env[e];
  }

  let ext = vscode.extensions.getExtension("TOTVS.tds-monitor");
  let dir = ext?.extensionPath;

  if (process.platform === "win32") {
    advpls = dir + "/node_modules/@totvs/tds-ls/bin/windows/advpls.exe";
  } else if (process.platform === "linux") {
    advpls = dir + "/node_modules/@totvs/tds-ls/bin/linux/advpls";
    if (statSync(advpls).mode !== 33261) {
      chmodSync(advpls, "755");
    }
  } else if (process.platform === "darwin") {
    advpls = dir + "/node_modules/@totvs/tds-ls/bin/mac/advpls";
    if (statSync(advpls).mode !== 33261) {
      chmodSync(advpls, "755");
    }
  }

  // Options to control the language server
  let serverOptions: ServerOptions = {
    command: advpls,
    args: args,
    options: { env: env }
  };

  // Options to control the language client
  let clientOptions: LanguageClientOptions = {
    //documentSelector: [{ scheme: "file", language: "advpl" }],
    // synchronize: {
    // 	configurationSection: 'cquery',
    // 	fileEvents: workspace.createFileSystemWatcher('**/.cc')
    // },
    //diagnosticCollectionName: "AdvPL",
    outputChannelName: "AdvPL (Monitor)",
    revealOutputChannelOn: RevealOutputChannelOn.Info,
    initializationOptions: clientConfig,
    //middleware: { provideCodeLenses: provideCodeLens }
    initializationFailedHandler: e => {
      vscode.window.showErrorMessage(e);
      console.log(e);
      console.log("---------------------------------------------------");

      console.log(advpls);
      console.error(clientOptions);

      return false;
    },
    errorHandler: new LsErrorHandler(getClientConfig())
  };

  languageClient = new MonitorLanguageClient(
    "monitorLanguageClient",
    "TOTVS AdvPL Language Server (Monitor)",
    serverOptions,
    clientOptions
  );

  languageClient.onDidChangeState((e: StateChangeEvent) => {
    languageClient._isRunning = e.newState === State.Running;
    languageClient._isStarting = e.newState === State.Starting;
  });

  languageClient
    .onReady()
    .then(() => {

      syncSettings();

      const configADVPL = vscode.workspace.getConfiguration(
        "totvsLanguageServer"
      );
      const isReconnectLastServer = configADVPL.get("reconnectLastServer");
      if (isReconnectLastServer) {
        reconnectLastServer();
      }

      languageClient._isReady = true;
      window.showInformationMessage("TOTVS Language Server: ready");
    })
    .catch(e => {
      window.showErrorMessage(e);
      throw e;
    });

  return Promise.resolve(languageClient);
}


function reconnectLastServer() {
  console.log("reconnectLastServer: Não implementado");
}


