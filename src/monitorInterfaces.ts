export enum Severity {
  OK,
  INFO,
  WARN,
  ERROR
}

export interface IError {
  severity: Severity;
  id: string;
  message: string;
}

export function createError(severity: Severity, id: string, message: string): IError {
  return { severity: severity, id: id, message: message };
}

export interface IMonitorItem {
  needAuthentication: any;
  reconnectToken: any;
  parent: string;
  id: string;
  type: string;
  name: string;
  port: number;
  address: string;
  buildVersion: string;
  secure: boolean;
  includes: string[];
  environments: string[];
  smartClient: string;
  token: string;
  environment: string;
  errors: IError[];
  username: string;
  password: string;

  initialize(element: any): void;
  isConnected(): boolean;

  connect(): Promise<boolean>;
  reconnect(): Promise<boolean>;

  updateProperties(content: any): Promise<boolean>;
  validConnection(): Promise<any>;
  validate(): Promise<void>;
  authenticate(): Promise<boolean>;

  getUsers(): any;
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