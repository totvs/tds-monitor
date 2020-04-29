import * as React from "react";
import { IMonitorItem, Severity } from "../../monitorInterfaces";
import ErrorBoundary from "../../helper/errorBoundary";
import MonitorTheme from "../../helper/theme";
import AddIcon from "@material-ui/icons/Add";
import LockIcon from "@material-ui/icons/Lock";
import KeyboardIcon from "@material-ui/icons/Keyboard";
import CheckIcon from "@material-ui/icons/Check";

import {
  Typography,
  TextField,
  Toolbar,
  IconButton,
  SvgIcon,
  MenuItem,
  InputAdornment,
  Button,
  CircularProgress,
  Fade,
  Grid,
  Paper,
} from "@material-ui/core";
import { ConnectDialogAction, IConnectDialogAction } from "../action";

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
  const [credential, setCredential] = React.useState({
    username: "",
    password: "",
  });
  const [isAddEnvironment, setAddEnvironment] = React.useState(false);
  const [isAuthenticating, setAuthenticating] = React.useState(false);
  const timerRef = React.useRef<number>();

  React.useEffect(
    () => () => {
      clearTimeout(timerRef.current);
    },
    []
  );

  if (listener === undefined) {
    listener = (event: MessageEvent) => {
      const message = event.data; // The JSON data our extension sent

      switch (message.command) {
        case ConnectDialogAction.UpdateWeb: {
          const data = { ...state, ...message.data };
          setState(data);
          setAuthenticating(false);
          break;
        }
        case ConnectDialogAction.Close: {
          let command: IConnectDialogAction = {
            action: ConnectDialogAction.Close,
            content: event.data,
          };
          props.vscode.postMessage(command);
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

  const handleButton = (event: React.MouseEvent<HTMLInputElement>) => {
    setAuthenticating(true);

    let command: IConnectDialogAction = {
      action: ConnectDialogAction.Authenticate,
      content: state,
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

  const getError = (target: string, noErrorMessage: string): string => {
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

  const folders = [{ label: "<servidores>", value: "/" }];
  const environments = [];
  state.environments.forEach((value, index) => {
    environments.push({ label: value, value: value });
  });

  const secureIndicator = state.secure
    ? {
        startAdorment: (
          <InputAdornment position="start">
            <LockIcon />
          </InputAdornment>
        ),
      }
    : {};

  const toggleEnvinroment = () => {
    setAddEnvironment(!isAddEnvironment);
  };

  return (
    <ErrorBoundary>
      <MonitorTheme>
        <Paper variant="outlined">
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu" disabled>
              <ServerIcon />
            </IconButton>
            <Typography variant="subtitle1">
              Informe suas credencias de acesso.
            </Typography>
          </Toolbar>
          <Grid container spacing={0}>
            <Grid item xs={12}>
              {!isAddEnvironment ? (
                <TextField
                  name="environment"
                  select
                  label="Ambiente"
                  value={state.environment}
                  fullWidth
                  disabled={isAuthenticating}
                  onChange={handleChange}
                  helperText={"Selecione o ambiente alvo."}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment
                        position="end"
                        onClick={toggleEnvinroment}
                      >
                        <AddIcon />
                      </InputAdornment>
                    ),
                  }}
                >
                  {environments.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <TextField
                  name="environment"
                  label="Ambiente"
                  value={state.environment}
                  fullWidth
                  disabled={isAuthenticating}
                  onChange={handleChange}
                  helperText={"Informe o ambiente alvo."}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment
                        position="end"
                        onClick={toggleEnvinroment}
                      >
                        <KeyboardIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            </Grid>

            <Grid item xs={4}>
              <TextField
                name="username"
                label="Usuário"
                value={credential.username}
                error={isError("username")}
                helperText={getError("username", "Usuário do Protheus")}
                onChange={handleChange}
                fullWidth
                disabled={isAuthenticating}
              />
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={4}>
              <TextField
                name="password"
                label="Senha"
                value={credential.password}
                type="password"
                error={isError("password")}
                helperText={getError("password", "Senha de acesso")}
                onChange={handleChange}
                fullWidth
                disabled={isAuthenticating}
              />
            </Grid>
            <Grid item xs={3}>
              <Button
                style={{ marginTop: 20 }}
                size="large"
                disabled={isError("username") || isAuthenticating}
                onClick={handleButton}
                startIcon={<CheckIcon />}
                fullWidth
              >
                {isAuthenticating ? (
                  <React.Fragment>
                    <Typography>Autenticando... </Typography>
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
                  <Typography>Autenticar</Typography>
                )}
              </Button>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="parent"
                select
                label="Destino"
                value={state.parent}
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
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Nome"
                fullWidth
                value={state.name}
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                type="uri"
                name="address"
                label="Endereço"
                value={state.address}
                disabled
                fullWidth
                inputProps={secureIndicator}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                name="port"
                label="Porta"
                type="number"
                value={state.port}
                disabled
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                name="buildVersion"
                label="Versão"
                value={state.buildVersion}
                disabled
              />
            </Grid>
          </Grid>
        </Paper>
      </MonitorTheme>
    </ErrorBoundary>
  );
}
