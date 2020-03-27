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

  updateProperties(content: any): Promise<boolean>;
  validConnection(): Promise<any>;
  validate(): Promise<void>;
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