import * as React from "react";

import { IMonitorItem, Severity } from "../../monitorInterfaces";
import ErrorBoundary from "../../helper/errorBoundary";
import MonitorTheme from "../../helper/theme";

import {
  Typography,
  TextField,
  Toolbar,
  IconButton,
  SvgIcon,
  MenuItem,
  InputAdornment,
} from "@material-ui/core";
import { ConnectDialogAction, IConnectDialogAction } from "../action";
import { LockIcon } from "../../helper/monitorIcons";

interface IConnectDialogProps {
  vscode: any;
  monitorItem: IMonitorItem;
}

//TODO: Empacotar ícones de forma semelhante ao material-ui
function ServerIcon(props: any) {
  return (
    <SvgIcon {...props}>
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z" />
    </SvgIcon>
  );
}

let listener: EventListenerOrEventListenerObject | undefined = undefined;

export default function ConnectDialog(props: IConnectDialogProps) {
  const [state, setState] = React.useState<IMonitorItem>(props.monitorItem);
  const [credential, setCredential] = React.useState( { username: "", password: ""});

  if (listener === undefined) {
    listener = (event: MessageEvent) => {
      const message = event.data; // The JSON data our extension sent

      switch (message.command) {
        case ConnectDialogAction.UpdateWeb: {
          const data = { ...state, ...message.data };
          setState(data);
          break;
        }
        default:
          console.log("***** ATENÇÃO: connectDialog.tsx");
          console.log("\tComando não reconhecido: " + message.command);
          break;
      }
    };

    window.addEventListener("message", listener);
  }

   const updateModel = (data: any) => {
     let command: IConnectDialogAction = {
       action: ConnectDialogAction.UpdateModel,
       content: data,
     };

     props.vscode.postMessage(command);
   };

   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const name = target.name;
    const value =
      target.type === "checkbox"
        ? target.checked
        : target.type === "file" && event.target.files.length > 0
        ? event.target.files[0].name
        : target.type === "number"
        ? parseInt(target.value)
        : target.value;
    const oldValue = credential[name];

    if (value !== oldValue) {
      const data = { ...credential, [name]: value };

      setCredential(data);
      updateModel(data);
    }
  };

   const getError = (
     target: string,
     noErrorMessage: string
   ): string => {
     let error = state.errors.find((err) => {
       if (
         err.severity === Severity.ERROR &&
         (target === undefined || err.id === target)
       ) {
         return err;
       }

       return undefined;
     });

     return error ? error.message : noErrorMessage;
   };

   const isError = (target?: string): boolean => {

    return !(getError(target, "_no_error_") === "_no_error_");
  };

  const serverTypes = [
    { label: "Protheus", value: "protheus" },
    { label: "Logix", value: "logix" },
  ];

  const folders = [{ label: "<servidores>", value: "/" }];

  const isSSL = state.secure;

  return (
    <React.Fragment>
      <ErrorBoundary>
        <MonitorTheme>
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu" disabled>
              <ServerIcon />
            </IconButton>
            <Typography variant="subtitle1">
              Informe suas credencias de acesso.
            </Typography>
          </Toolbar>
          <React.Fragment>
            <TextField
              name="parent"
              select
              label="Destino"
              value={state.parent}
              disabled
            >
              {folders.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              name="type"
              select
              label="Tipo"
              value={state.type}
              disabled
            >
              {serverTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField name="name" label="Nome" value={state.name} disabled />
            <TextField
              type="uri"
              name="address"
              label="Endereço"
              value={state.address}
              disabled
              inputProps={{
                ...(isSSL && (
                  <React.Fragment>
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  </React.Fragment>
                )),
              }}
            />
            <TextField
              name="port"
              label="Porta"
              type="number"
              value={state.port}
              disabled
            />
            <TextField
              name="buildVersion"
              label="Versão"
              value={state.buildVersion}
              disabled
            />
            <TextField
              name="username"
              label="Usuário"
              value={credential.username}
              error={isError("username")}
              helperText={getError("port",
                "Usuário e/ou senha inválidos."
              )}
              onChange={handleChange}
            />
            <TextField
              name="password"
              label="Senha"
              value={credential.password}
              type="password"
              error={isError("password")}
              helperText={getError("port",
                "Usuário e/ou senha inválidos."
              )}
              onChange={handleChange}
            />
          </React.Fragment>
        </MonitorTheme>
      </ErrorBoundary>
    </React.Fragment>
  );
}
