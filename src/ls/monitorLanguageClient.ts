import { LanguageClient } from "vscode-languageclient";
import { IValidationServer } from "../monitorInterfaces";

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

  public connect(connType: number, type: number, id: string, name: string, address: string, port: number, environment: string, buildVersion: string, secure: boolean) {
    const request = super
      .sendRequest('$totvsserver/connect', {
        connectionInfo: {
          connType: connType,
          serverName: name,
          identification: id,
          serverType: type,
          server: address,
          port: port,
          buildVersion: buildVersion,
          bSecure: secure,
          environment: environment,
          autoReconnect: true
        }
      }).then(
        (connectionNode: {
          connectionToken: string;
          needAuthentication: boolean;
        }) => {
          if (connectionNode.connectionToken) {
            return {
              token: connectionNode.connectionToken,
              needAuthentication: connectionNode.needAuthentication
            };
          } else {
            throw new Error('Error connecting server');
          }
        }, (err) => {
          throw err;
        }
      );

    return request;
  }

  authenticate(token: string, environment: string, user: string, password: string) {
    const request = super
      .sendRequest('$totvsserver/authentication', {
        authenticationInfo: {
          connectionToken: token,
          environment: environment,
          user: user,
          password: password
        }
      }).then((value: {
        id: any;
        osType: number;
        connectionToken: string;
      }) => {
        let token: string = value.connectionToken;
        return token;
      }, (err) => {
        throw err;
      });

    return request;
  }

  public disconnect(token: string, name: string): Promise<void> {
    const request = super
      .sendRequest('$totvsserver/disconnect', {
        disconnectInfo: {
          connectionToken: token,
          serverName: name
        }
      }).then((disconnectInfo: {
        id: any;
        code: any;
        message: string;
      }) => {
        if (disconnectInfo !== undefined && disconnectInfo.code === undefined) {

        }
      }, (err) => {
        throw err;
      });

    return request;
  }

  public reconnect(name: string, connectionToken: string): Promise<any> {
    const request = super
      .sendRequest('$totvsserver/reconnect', {
        reconnectInfo: {
          connectionToken: connectionToken,
          serverName: name
        }
      }).then((reconnectNode: {
        connectionToken: string;
        environment: string;
        user: string;
      }) => {
        return reconnectNode;
      }, (err) => {
        throw err;
      });

    return request;
  }

  public getId(): Promise<string> {
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
