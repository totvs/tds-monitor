import { LanguageClient } from "vscode-languageclient";
import { IValidationServer, IKeyInfo, IMonitorItem } from "../monitorInterfaces";

export class MonitorLanguageClient extends LanguageClient {
  _isRunning: boolean = false;
  _isReady: boolean = false;
  _isStarting: boolean = false;

  public get isRunning(): boolean {
    return this._isRunning;
  }

  public get isReady(): boolean {
    return this._isReady;
  }

  public get isStarting(): boolean {
    return this._isStarting;
  }

  public validation(address: string, port: number): Promise<IValidationServer> {
    const request = super
      .sendRequest("$totvsserver/validation", {
        validationInfo: {
          server: address,
          port: port
        }
      })
      .then(
        (value: any) => {
          return { build: value.buildVersion, secure: value.secure };
        },
        err => {
          super.error(err.message, err);
          throw err;
        }
      );

    return request;
  }

  public _getId(): Promise<string> {
    const request = super.sendRequest("$totvsserver/getId").then(
      (response: any) => {
        if (response.id) {
          return response.id;
        }

        return "";
      },
      err => {
        super.error(err.message, err);
        throw err;
      }
    );

    return request;
  }

  public _validKey(keyInfo: IKeyInfo): Promise<any> {
    const request = this.sendRequest("$totvsserver/validKey", {
      keyInfo: {
        id: keyInfo.id,
        issued: keyInfo.issued,
        expiry: keyInfo.expire,
        canOverride: keyInfo.canOverride,
        token: keyInfo.token
      }
    }).then(
      (response: any) => {
        return response;
      },
      err => {
        super.error(err.message, err);
        throw err;
      }
    );

    return request;
  }

  public _authenticate(
    server: IMonitorItem,
    environment: string,
    username: string,
    password: string
  ): Promise<string> {
    const request = this.sendRequest("$totvsserver/authentication", {}).then(
      (response: any) => {
        return response.content;
      },
      err => {
        super.error(err.message, err);
        throw err;
      }
    );

    return request;
  }

  public changeSetting(scope: string, key: string, value: any) {
    const request = this.sendRequest("$totvsserver/changeSetting", {
      changeSettingInfo: {
        scope: scope, key: key, value: value
      }
    }).then(
      (response: any) => {
        return response.content;
      },
      err => {
        super.error(err.message, err);
        //throw err;
      }
    );

    return request;
  }

}
