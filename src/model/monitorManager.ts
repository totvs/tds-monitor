import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import {
  IServersConfig,
  ServersConfig,
  IPermissionsInfo
} from "./serversConfig";
import { IMonitorItem } from "../monitorInterfaces";
import { MonitorItem, TreeMonitorItem } from "./monitorItem";
import MonitorConfiguration from "../monitorConfiguration";

class ServerManager {
  /**
   * Emite a notificação de seleção de servidor/ambiente
   */
  private _onDidRefreshServerManager = new vscode.EventEmitter<null>();
  private _onDidSelectedServer = new vscode.EventEmitter<IMonitorItem | null>();
  private _onDidSelectedKey = new vscode.EventEmitter<string>();

  private _serversConfig: IServersConfig;
  private _currentServer: IMonitorItem | null = null;

  constructor() {

    this._serversConfig = this.loadServersConfig();

    this.setCurrentServer(null);
    this.refresh();

    MonitorConfiguration.onDidMonitorConfiguration(() => {
      this._serversConfig = this.loadServersConfig();
      this.refresh();
    });
  }


  private refresh() {
    this._onDidRefreshServerManager.fire();
  }

  getServers(): IMonitorItem[] {
    return this._serversConfig.configurations;
  }

  /**
   *  Subscrição para evento de modificação do arquivo servers.json.
   * */
  get onDidRefreshServerManager(): vscode.Event<null> {
    return this._onDidRefreshServerManager.event;
  }

  /**
   * Subscrição para evento de seleção de servidor/ambiente.
   */
  get onDidSelectedServer(): vscode.Event<IMonitorItem | null> {
    return this._onDidSelectedServer.event;
  }

  /**
   * Subscrição para evento de chave de compilação.
   */
  get onDidSelectedKey(): vscode.Event<string> {
    return this._onDidSelectedKey.event;
  }

  /**
   * Gera um id de servidor
   */
  public generateRandomID() {
    return (
      Math.random()
        .toString(36)
        .substring(2, 15) +
      Date.now().toString(36) +
      Math.random()
        .toString(36)
        .substring(2, 15)
    );
  }

  /**
   * Retorna todo o conteudo do servers.json
   */
  private loadServersConfig(): IServersConfig {
    const configFile = this.getFilename();
    const exist = fs.existsSync(configFile);
    const serversConfig = new ServersConfig();

    if (exist) {
      const content = fs.readFileSync(configFile).toString();
      const data = JSON.parse(content);

      const elements: Array<any> = [];

      for (let index = 0; index < data.configurations.length; index++) {
        const element = data.configurations[index];
        const monitorItem = this.createMonitorItem();
        // tslint:disable-next-line: no-unused-expression
        monitorItem.initialize(element);
        monitorItem.token = "";
        monitorItem.reconnectToken = "";

        if (data.savedTokens) {
          const savedToken = data.savedTokens[`${monitorItem.id}:${monitorItem.environment}`];
          if (savedToken) {
            monitorItem.reconnectToken = savedToken.token;
          }
        }
        elements.push(monitorItem);
      }
      data.configurations = elements;

      return data;
    }

    return serversConfig;
  }

  /**
   *  Grava o arquivo servers.json com a configuração.
   */
  private persistServersInfo() {
    const configFile = this.getFilename();
    const content: string = JSON.stringify(this._serversConfig, null, "\t");

    fs.writeFileSync(configFile, content);
  }

  /**
   * Recupera o servidor corrent
   */
  getCurrentServer(): IMonitorItem | null {
    return this._currentServer;
  }

  /**
   * Indica o servidor corrente
   */
  setCurrentServer(server: IMonitorItem | null) {
    if (this._currentServer !== server) {
      this._currentServer = server;
      this._onDidSelectedServer.fire(this._currentServer);
    }
  }

  /**
   * Recupera a lista de includes do arquivo servers.json
   */
  getIncludes(
    absolutePath: boolean = false,
    server: any = undefined
  ): Array<string> {
    let includes: Array<string>;

    if (
      server !== undefined &&
      server.includes !== undefined &&
      server.includes.length > 0
    ) {
      includes = server.includes as Array<string>;
    } else {
      includes = this._serversConfig.includes;
    }

    if (includes.length > 0) {
      if (absolutePath) {
        const ws: string = vscode.workspace.rootPath || "";
        includes.forEach((value, index, elements) => {
          if (value.startsWith(".")) {
            value = path.resolve(ws, value);
          } else {
            value = path.resolve(value.replace("${workspaceFolder}", ws));
          }

          try {
            const fi: fs.Stats = fs.lstatSync(value);
            if (!fi.isDirectory) {
              const msg: string =
                "Review the folder list in order to search for settings (.ch). Not recognized as folder: {0}";//); //,);
              vscode.window.showWarningMessage(msg);
            } else {
              elements[index] = value;
            }
          } catch (error) {
            const msg: string = "Review the folder list in order to search for settings (.ch). Invalid folder: {0}";//value );
            //console.log(error);
            vscode.window.showWarningMessage(msg);
            elements[index] = "";
          }
        });
      }
    } else {
      vscode.window.showWarningMessage("List of folders to search for definitions not configured.");
    }

    return includes || [];
  }

  /**
   * Indica a lista de includes do arquivo servers.json
   */
  setIncludes(
    includeList: Array<string>,
    server: IMonitorItem | any = undefined
  ) {
    if (server !== undefined) {
      server.includes = includeList;
    } else {
      this._serversConfig.includes = includeList;
    }

    this.persistServersInfo();
  }

  getFilename(): string {
    return MonitorConfiguration.getServerFilename();
  }

  delete(serverItem: IMonitorItem) {
    const pos = this._serversConfig.configurations.indexOf(serverItem);

    if (pos > -1) {
      this._serversConfig.configurations.splice(pos);
      this.persistServersInfo();
      this.refresh();
    }
  }

  add(serverItem: IMonitorItem) {
    const pos = this._serversConfig.configurations.findIndex(
      (element: IMonitorItem) => {
        return element.name.toLowerCase() === serverItem.name.toLowerCase();
      }
    );

    if (pos > -1) {
      vscode.window.showErrorMessage(
        "Nome de identificação do servidor deve ser único."
      );
      throw new Error("Nome de identificação do servidor deve ser único.");
    }

    serverItem.id = this.generateRandomID();
    this._serversConfig.configurations.push(serverItem);
    this.persistServersInfo();
    this.refresh();

    vscode.window.showInformationMessage(
      `Servidor [${serverItem.name}] registrado.`);
  }

  public createMonitorTreeItem(monitorItem?: IMonitorItem, name?: string): TreeMonitorItem {
    let mi = monitorItem;

    if (!mi) {
      mi = new MonitorItem();
      mi.name = name ? "Novo " + this.getServers().length : name;
    }

    return new TreeMonitorItem(mi);
  }

  public createMonitorItem(name?: string): IMonitorItem {
    const mi = new MonitorItem();
    mi.name = name ? "Novo " + this.getServers().length : name;

    return mi;
  }

  removeExpiredAuthorization(): void {
    this._serversConfig.permissions.authorizationToken = "";
    this.persistServersInfo();
  }

  removeAuthorizationToken(): void {
    this.removeExpiredAuthorization();
  }

  getServerById(ID: string): IMonitorItem | undefined {
    const result = this.getServers().find((element: IMonitorItem) => {
      return (element.id === ID);
    });

    return result;
  }

  getServerByName(name: string): IMonitorItem | undefined {
    const result = this.getServers().find((element: IMonitorItem) => {
      return (element.name === name);
    });

    return result;
  }

  rename(ID: string, newName: string): boolean {
    const server = this.getServerById(ID);

    if (server) {
      server.name = newName;
      this.persistServersInfo();
      return true;
    }

    return false;
  }

  savePermissions(response: any): void {
    this.setPermissions(response.token, response.userId, response.privilegies);
    this.persistServersInfo();
  }

  getPermissions(): IPermissionsInfo {
    return this._serversConfig.permissions;
  }

  //TODO: rever
  private setPermissions(
    authorizationToken: string,
    userId: string,
    privilegies: string[]
  ) {
    this._serversConfig.permissions.authorizationToken = authorizationToken;
    this._serversConfig.permissions.userId = userId;
    this._serversConfig.permissions.privilegies = privilegies;
  }
}

export const serverManager: ServerManager = new ServerManager();
