export interface IMonitorItem {
  id: string;
  type: string;
  name: string;
  port: number;
  address: string;
  buildVersion: string;
  secure: boolean;
  includes: string[];
  environments: string[];
  smartClient?: string;
  token: string;
  environment: string;

  connect(): Promise<boolean>;
  reconnect(): Promise<boolean>;
  validConnection(): Promise<boolean>;
}

export interface IValidationServer {
  build: string;
  secure: boolean;
  err?: any;
}

export interface IKeyInfo {
  id: string;
  issued: string;
  expire: string;
  canOverride: boolean;
  token: string;
}

export interface IChangeSettingInfo {
  scope: string;
  key: string;
  value: any;
}