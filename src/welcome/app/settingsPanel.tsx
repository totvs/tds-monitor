import * as React from "react";
import FormControl from "@material-ui/core/FormControl";
import {
  InputLabel,
  Input,
  FormHelperText,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  MenuItem
} from "@material-ui/core";

interface ISettingsPanelProps {
  vscode: any;
  showWelcomePage: boolean;
  serverJsonLocation: any;
}

const locationOptions = [
  { value: "user", label: "userFile" },
  { value: "user_monitor", label: "monitorFile" },
  { value: "workspace", label: "workspaceFile" }
];

export default function SettingsPanel(props: ISettingsPanelProps) {
  const [state, setState] = React.useState({
    showWelcomePage: props.showWelcomePage,
    serverJsonLocation: props.serverJsonLocation
  });

  const handleShowWelcomeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setState({ ...state, showWelcomePage: event.target.checked }); //[event.target.name]: event.target.checked });
  };

  const handleServerLocationChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setState({ ...state, serverJsonLocation: event.target.value }); //[event.target.name]: event.target.checked });
  };

  return (
    <React.Fragment>
      <Typography variant="subtitle2" component="h3">
        Configurações Atuais
      </Typography>
      <TextField
        select
        label="Arquivo de definição"
        value={state.serverJsonLocation}
        onChange={handleServerLocationChange}
        helperText="Indica qual arquivo de definição de servidores a utilizar."
      >
        {locationOptions.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      <FormControl>
        <InputLabel htmlFor="my-input">Email address</InputLabel>
        <Input id="my-input" aria-describedby="my-helper-text" />
        <FormHelperText id="my-helper-text">
          We'll never share your email.
        </FormHelperText>
      </FormControl>
      <FormGroup row>
        <FormControlLabel
          control={
            <Checkbox
              checked={state.showWelcomePage}
              onChange={handleShowWelcomeChange}
            />
          }
          label="Apresentar Boas vindas ao iniciar."
        />
      </FormGroup>
      <Checkbox
        checked={state.showWelcomePage}
        onChange={handleShowWelcomeChange}
      />
      Apresentar Boas vindas ao iniciar
    </React.Fragment>
  );
}
