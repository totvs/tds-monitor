import * as React from "react";
import {
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  MenuItem,
  Card,
  CardHeader,
  CardContent,
  Avatar,
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
    { value: "serverFile", label: props.optionsLocation.serverFile },
    { value: "monitorFile", label: props.optionsLocation.monitorFile },
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
    <Card variant="outlined" style={{height: 280}}>
      <CardHeader
        title="Configurações"
        subheader="Determina o comportamento da extensão."
        avatar={
          <Avatar aria-label="recipe">
            C
          </Avatar>
        }
      />

      <CardContent>
        <FormGroup row>
          <TextField
            select
            label="Arquivo de servidores"
            value={state.serverJsonLocation}
            onChange={handleServerLocationChange}
            helperText="Arquivo de servidores em uso."
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
      </CardContent>
    </Card>
  );
}
