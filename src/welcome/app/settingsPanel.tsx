import * as React from "react";
import {
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  MenuItem,
} from "@material-ui/core";
import { IWelcomePageAction, WelcomePageAction } from "../actions";

interface ISettingsPanelProps {
  vscode: any;
  showWelcomePage: boolean;
  serverJsonLocation: any;
  optionsLocation: any;
}

export default function SettingsPanel(props: ISettingsPanelProps) {
  const [state, setState] = React.useState({
    showWelcomePage: props.showWelcomePage,
    serverJsonLocation: props.serverJsonLocation,
    optionsLocation: props.optionsLocation,
  });

  const locationOptions = [
    { value: "user", label: props.optionsLocation.userFile },
    { value: "user_monitor", label: props.optionsLocation.monitorFile },
  ];

  const saveData = (data: any) => {
    let command: IWelcomePageAction = {
      action: WelcomePageAction.Save,
      content: data,
    };

    props.vscode.postMessage(command);
  };

  const handleShowWelcomeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const data = { ...state, showWelcomePage: event.target.checked };

    setState(data);
    saveData(data);
  };

  const handleServerLocationChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const data = { ...state, serverJsonLocation: event.target.value };

    setState(data);
    saveData(data);
  };

  return (
    <React.Fragment>
      <Typography variant="subtitle2" component="h3">
        <strong>Configurações Atuais</strong>
      </Typography>

      <FormGroup row>
        <TextField
          select
          label="Arquivo de definição"
          value={state.serverJsonLocation}
          onChange={handleServerLocationChange}
          helperText="Indica qual arquivo de definição de servidores em uso."
        >
          {locationOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </FormGroup>

      <FormGroup row>
        <FormControlLabel
          control={
            <Checkbox
              checked={state.showWelcomePage}
              onChange={handleShowWelcomeChange}
            />
          }
          label="Apresentar esta página ao iniciar a extensão."
        />
      </FormGroup>
    </React.Fragment>
  );
}
