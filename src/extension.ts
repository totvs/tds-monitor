/*---------------------------------------------------------
 * Copyright (C) TOTVS S.A. All rights reserved.
 *--------------------------------------------------------*/

import vscode, { workspace, window, commands } from 'vscode';
import { LanguageClient } from 'vscode-languageclient';
import { ServerCommands } from './monitorCommands';
import { getLanguageClient } from './ls/monitorClient';
import { isConfigurationChanged } from './ls/languageServerSettings';
import { showWelcomePage } from './welcome/welcomePageLoader';

export let languageClient: LanguageClient;

export async function activate(context: vscode.ExtensionContext) {
  console.debug('tds-monitor: register commands.');

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

  //Mostra a pagina de Welcome.
  showWelcomePage();
  console.log('Congratulations, your extension "tds-monitor" is now active!');
  window.showInformationMessage(
    'The extension "tds-monitor" is now active!'
  );
}

// this method is called when your extension is deactivated
export function deactivate() {
  console.log('Thank you for using our extension "tds-monitor"!\nBye!!');

  //Utils.deleteSelectServer();
}

