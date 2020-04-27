import * as React from "react";

import { IMonitorItem, Severity } from "../../monitorInterfaces";
import ErrorBoundary from "../../helper/errorBoundary";
import MonitorTheme from "../../helper/theme";
import CancelIcon from "@material-ui/icons/Cancel";
import DoneIcon from "@material-ui/icons/Done";
import OpenInBrowserIcon from "@material-ui/icons/OpenInBrowser";

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
  SvgIcon,
  Grid,
  InputAdornment,
  Button,
  Fade,
  CircularProgress,
} from "@material-ui/core";
import { IAddServerAction, AddServerAction } from "../action";
import CheckIcon from "@material-ui/icons/Check";

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
  const [isValidateVersion, setValidateVersion] = React.useState<boolean>(false);

  if (listener === undefined) {
    listener = (event: MessageEvent) => {
      const message = event.data; // The JSON data our extension sent

      switch (message.command) {
        case AddServerAction.UpdateWeb: {
          const data = { ...state, ...message.data };
          setState(data);
          setValidateVersion(false);
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
      content: data,
    };

    props.vscode.postMessage(command);
  };

  const handleNavButton = (event: React.ChangeEvent<{}>, value: number) => {
    let command: IAddServerAction = {
      action: value,
      content: state,
    };

    props.vscode.postMessage(command);
  };

  const selectSmartClient = () => {
    let command: IAddServerAction = {
      action: AddServerAction.SelectSmartClient,
      content: state.smartClient,
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

  const getError = (
    target: keyof IMonitorItem,
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

  const isError = (target?: keyof IMonitorItem): boolean => {
    return !(getError(target, "_no_error_") === "_no_error_");
  };

  const serverTypes = [
    { label: "Protheus", value: "protheus" },
    { label: "Logix", value: "logix" },
  ];

  const handleButton = (event: React.MouseEvent<HTMLInputElement>) => {
    setValidateVersion(true);

    let command: IAddServerAction = {
      action: AddServerAction.Validate,
      content: state,
    };

    props.vscode.postMessage(command);
  };

  const folders = [{ label: "<servidores>", value: "/" }];

  return (
    <React.Fragment>
      <ErrorBoundary>
        <MonitorTheme>
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu" disabled>
              <ServerIcon />
            </IconButton>
            <Typography variant="caption">
              Informe parâmetros de conexão e confirme.
            </Typography>
          </Toolbar>
          <Grid container spacing={0}>
            <Grid item xs={12}>
              <TextField
                name="parent"
                select
                label="Destino"
                value={state.parent}
                onChange={handleChange}
                helperText={getError(
                  "parent",
                  "Selecione a pasta para melhorar a organização."
                )}
                disabled
                fullWidth
              >
                {folders.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <TextField
              error={isError("smartClient")}
              name="smartClient"
              label="SmartClient"
              value={state.smartClient}
              helperText={getError("smartClient", "Executável SmartClient.")}
              onChange={handleChange}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" onClick={selectSmartClient}>
                    <OpenInBrowserIcon />
                  </InputAdornment>
                ),
              }}
            />

            <Grid item xs={3}>
              <TextField
                name="type"
                select
                label="Tipo"
                fullWidth
                value={state.type}
                onChange={handleChange}
                helperText="Selecione o tipo de aplicação servidora."
              >
                {serverTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={9}>
              <TextField
                error={isError("name")}
                name="name"
                label="Nome"
                required
                value={state.name}
                fullWidth
                helperText={getError(
                  "name",
                  "Informe o nome para identificação do registro."
                )}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                error={isError("address")}
                type="uri"
                name="address"
                label="Endereço"
                required
                fullWidth
                value={state.address}
                helperText={getError(
                  "address",
                  "Informe o nome ou endereço IP e porta de conexão."
                )}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                error={isError("port")}
                name="port"
                label="Porta"
                required
                type="number"
                value={state.port}
                helperText={getError(
                  "port",
                  "Informe a porta de conexão. Normalmente é a mesma do SmartClient."
                )}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={2}>
              <Button
                style={{ marginTop: 20 }}
                size="large"
                disabled={isValidateVersion}
                onClick={handleButton}
                startIcon={<CheckIcon />}
                fullWidth
              >
                {isValidateVersion ? (
                  <React.Fragment>
                    <Typography>Validando... </Typography>
                    <Fade
                      in={true}
                      style={{
                        transitionDelay: "800ms",
                      }}
                      unmountOnExit
                    >
                      <CircularProgress />
                    </Fade>
                  </React.Fragment>
                ) : (
                  <Typography>Validar</Typography>
                )}
              </Button>
            </Grid>

            <Grid item xs={3}>
              <TextField
                error={isError("buildVersion")}
                name="buildVersion"
                label="Versão"
                value={state.buildVersion}
                helperText={getError("buildVersion", "Versão do servidor.")}
                disabled
                fullWidth
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                name="secure"
                control={<Checkbox checked={state.secure} value="ssl" />}
                label="Conexão segura (SSL)"
                onChange={handleChange}
                disabled
              />
            </Grid>
            <Grid item xs={9}></Grid>
          </Grid>

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
              value={AddServerAction.SaveAndClose}
              disabled={isError("buildVersion")}
              icon={<DoneIcon />}
            />
            <BottomNavigationAction
              label="Cancel"
              value={AddServerAction.Close}
              icon={<CancelIcon />}
            />
          </BottomNavigation>
        </MonitorTheme>
      </ErrorBoundary>
    </React.Fragment>
  );
}
