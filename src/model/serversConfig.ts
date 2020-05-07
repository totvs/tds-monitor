import { IMonitorItem } from "../monitorInterfaces";

export interface IPermissionsInfo {
  authorizationToken: string;
  userId: string;
  privilegies: string[];
  issued: string;
  buildType: string;
  tokenKey: string;
  path: string;
  machineId: string;
  canOverride: boolean;
  expire: string;
}

class PermissionsInfo implements IPermissionsInfo {
  issued: string = "";
  expire: string = "";
  buildType: string = "";
  tokenKey: string = "";
  path: string = "";
  machineId: string = "";
  canOverride: boolean = false;
  authorizationToken: string = "";
  userId: string = "";
  privilegies: string[] = [];
}

export interface IServersConfig {
  version: string;
  includes: string[];
  permissions: IPermissionsInfo;
  connectedServer: {};
  configurations: Array<IMonitorItem>;
}

export class ServersConfig implements IServersConfig {
  version: string = "0.3.0";
  includes: string[] = [];
  permissions = new PermissionsInfo();
  connectedServer = {};
  configurations: Array<IMonitorItem> = [];
}
