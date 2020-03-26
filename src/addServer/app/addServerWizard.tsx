import * as React from "react";

import { IMonitorItem, Severity } from "../../monitorInterfaces";
import ErrorBoundary from "../../helper/errorBoundary";
import MonitorTheme from "../../helper/theme";
import CancelIcon from "@material-ui/icons/Cancel";
import DoneIcon from "@material-ui/icons/Done";

import {
  Typography,
  BottomNavigation,
  BottomNavigationAction,
  FormControlLabel,
  TextField,
  Checkbox,
  Toolbar,
  IconButton,
  MenuItem,
  SvgIcon
} from "@material-ui/core";
import { IAddServerAction, AddServerAction } from "../action";

interface IAddServerWizardProps {
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

export default function AddServerWizard(props: IAddServerWizardProps) {
  const [activeStep, setActiveStep] = React.useState(1);
  const [state, setState] = React.useState<IMonitorItem>(props.monitorItem);

  if (listener === undefined) {
    listener = (event: MessageEvent) => {
      const message = event.data; // The JSON data our extension sent

      switch (message.command) {
        case AddServerAction.UpdateWeb: {
          const data = { ...state, ...message.data };
          setState(data);
          break;
        }
        default:
          console.log("***** ATENÇÃO: addServerWizard.tsx");
          console.log("\tComando não reconhecido: " + message.command);
          break;
      }
    };

    window.addEventListener("message", listener);
  }

  const updateModel = (data: any) => {
    let command: IAddServerAction = {
      action: AddServerAction.UpdateModel,
      content: data
    };

    props.vscode.postMessage(command);
  };

  const handleNavButton = (event: React.ChangeEvent<{}>, value: number) => {
    let command: IAddServerAction = {
      action: AddServerAction.NavButton,
      content: value
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
    const oldValue = state[name];

    if (value !== oldValue) {
      const data = { ...state, [name]: value };

      setState(data);
      updateModel(data);
    }
  };

  const getError = (target: keyof IMonitorItem, noErrorMessage: string): string => {
    let error = state.errors.find(err => {
        console.log(err.id + "=" + err.message);
        if (
          err.severity === Severity.ERROR &&
          ((target === undefined) || (err.id === target))
        ) {
          return err;
        }

        return undefined;
      });

    return error ? error.message : noErrorMessage;
  };

  const isError = (target?: keyof IMonitorItem): boolean => {

    return !(getError(target, "_no_error_") === "_no_error_");
  };

  const serverTypes = [
    { label: "Protheus", value: "protheus" },
    { label: "Logix", value: "logix" }
  ];

  const folders = [{ label: "<servidores>", value: "/" }];

  return (
    <React.Fragment>
      <ErrorBoundary>
        <MonitorTheme>
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu" disabled>
              <ServerIcon />
            </IconButton>
            <Typography variant="caption">Servidor: Novo</Typography>
            &nbsp;&nbsp;
            <Typography variant="subtitle1">
              Informe parâmetros de conexão e confirme.
            </Typography>
          </Toolbar>
          <React.Fragment>
            <TextField
              name="parent"
              select
              label="Destino"
              value={state.parent}
              onChange={handleChange}
              helperText={getError("parent",
                "Selecione a pasta para melhorar a organização."
              )}
              disabled
            >
              {folders.map(option => (
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
              onChange={handleChange}
              helperText="Selecione o tipo de aplicação servidora."
            >
              {serverTypes.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              error={isError("smartClient")}
              name="smartClient"
              label="SmartClient"
              value={state.smartClient}
              helperText={getError("smartClient", "Executável SmartClient.")}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              error={isError("name")}
              name="name"
              label="Nome"
              required
              value={state.name}
              helperText={getError( "name",
                "Informe o nome para identificação do registro."
              )}
              onChange={handleChange}
            />
            <TextField
              error={isError("address")}
              type="uri"
              name="address"
              label="Endereço"
              required
              value={state.address}
              helperText={getError("address",
                "Informe o nome ou endereço IP e porta de conexão."
              )}
              onChange={handleChange}
            />
            <TextField
              error={isError("port")}
              name="port"
              label="Porta"
              required
              type="number"
              value={state.port}
              helperText={getError("port",
                "Informe a porta de conexão. Normalmente é a mesma do SmartClient."
              )}
              onChange={handleChange}
            />
            <TextField
              error={isError("buildVersion")}
              name="buildVersion"
              label="Versão"
              value={state.buildVersion}
              helperText={getError("buildVersion", "Versão do servidor.")}
              disabled
            />
            <FormControlLabel
              name="secure"
              control={<Checkbox checked={state.secure} value="ssl" />}
              label="Conexão segura (SSL)"
              onChange={handleChange}
            />
            <BottomNavigation
              value={activeStep}
              showLabels
              onChange={(event, newValue) => {
                handleNavButton(event, newValue);
                setActiveStep(newValue);
              }}
            >
              <BottomNavigationAction
                label={"Finish"}
                value={0}
                disabled={isError("buildVersion")}
                icon={<DoneIcon />}
              />
              <BottomNavigationAction
                label="Cancel"
                value={1}
                icon={<CancelIcon />}
              />
            </BottomNavigation>
          </React.Fragment>
        </MonitorTheme>
      </ErrorBoundary>
    </React.Fragment>
  );
}
