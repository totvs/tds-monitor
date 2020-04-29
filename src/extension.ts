/*---------------------------------------------------------
 * Copyright (C) TOTVS S.A. All rights reserved.
 *--------------------------------------------------------*/

import vscode, { workspace, window, commands } from 'vscode';
import { LanguageClient } from 'vscode-languageclient';
import { ServerCommands } from './monitorCommands';
import { getLanguageClient } from './ls/monitorClient';
import { isConfigurationChanged } from './ls/languageServerSettings';
import { showWelcomePage } from './welcome/welcomePageLoader';
import { MonitorsExplorer } from './view/monitorsExplorer';

export let languageClient: LanguageClient;

export async function activate(context: vscode.ExtensionContext) {
  ServerCommands.register(context);
  //context.subscriptions.push(vscode.commands.registerCommand('tds-monitor.showWelcomePage', () => { showWelcomePage(true); }));

  languageClient = await getLanguageClient();
  context.subscriptions.push((languageClient).start());

  context.subscriptions.push(
    workspace.onDidChangeConfiguration(
      (e: vscode.ConfigurationChangeEvent) => {
        if (isConfigurationChanged()) {
          window
            .showInformationMessage(
              "Please reload to apply the 'AdvPL.{0}' configuration change.",
              "Reload"
            )
            .then(selected => {
              if (selected === "Reload") {
                commands.executeCommand("workbench.action.reloadWindow");
              }
            });
        }
      }
    )
  );

  //View
  let viewServer = new MonitorsExplorer(context);
  if (!viewServer) {
    window
      .showErrorMessage("Não foi possível inicializar visão 'TOTVS Monitor'."
      );
  }

  //Mostra a pagina de Boas Vindas.
  showWelcomePage();
  console.log('Congratulations, your extension "totvs-monitor" is now active!');
  window.showWarningMessage(
    'The extension "totvs-monitor" is now active!'
  );
}

// this method is called when your extension is deactivated
export function deactivate() {
  console.log('Thank you for using our extension "totvs-monitor"!\nBye!!');

  //Utils.deleteSelectServer();
}

