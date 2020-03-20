import * as vscode from "vscode";

export async function syncSettings() {
  // no momento, o TDS Monitor não precisa sincrozinar nada com o server
  // se for necessário sincronizar configurações, ative o cófigo abaixo e
  // use o método changeSetting como o exemplo.

  //let config = getClientConfig();
  //let languageClient: ProtheusLanguageClient = await getLanguageClient();

  //let behavior = config.get("editor.toggle.autocomplete");
  //languageClient.changeSetting("advpls", "autocomplete", behavior);
}

function resolveVariablesInString(value: string) {
  let rootPath =
    vscode.workspace.rootPath !== undefined ? vscode.workspace.rootPath : "";
  return value.replace("${workspaceFolder}", rootPath);
}

function resolveVariablesInArray(value: any[]): any[] {
  return value.map(v => resolveVariables(v));
}

function resolveVariables(value: any): any {
  if (typeof value === "string") {
    return resolveVariablesInString(value);
  }
  if (Array.isArray(value)) {
    return resolveVariablesInArray(value);
  }
  return value;
}

export function getClientConfig() {
  let configMapping = [["launchArgs", "launch.args"]];
  let clientConfig: any = {};
  let config = vscode.workspace.getConfiguration("totvsLanguageServer");

  for (let prop of configMapping) {
    let value = config.get(prop[1]);

    if (value !== undefined && value !== null) {
      let subprops = prop[0].split(".");
      let subconfig: any = clientConfig;
      for (let subprop of subprops.slice(0, subprops.length - 1)) {
        if (!subconfig.hasOwnProperty(subprop)) {
          subconfig[subprop] = {};
        }
        subconfig = subconfig[subprop];
      }
      subconfig[subprops[subprops.length - 1]] = resolveVariables(value);
    }
  }

  return config;
}

export function isConfigurationChanged(): boolean {
  let result = false;
  let clientConfig: any = {};

  for (let key in clientConfig) {
    if (!clientConfig.hasOwnProperty(key)) {
      continue;
    }

    //TODO: esta confuso
    if (
      JSON.stringify(clientConfig[key]) !== JSON.stringify(clientConfig[key])
    ) {
      result = true;

      break;
    }
  }

  if (result) {
    syncSettings();
  }

  return result;
}

export function getAdvPlConfig(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration("AdvPL"); //TODO: classe
}
