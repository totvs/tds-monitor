import React from "react";
import FormControl from "@material-ui/core/FormControl";
import { InputLabel, Input, FormHelperText } from "@material-ui/core";



interface ISettingsPanelProps {
  vscode: any;
  showWelcomePage: boolean;
}

export default function SettingsPanel(props: ISettingsPanelProps) {
  return (
    <React.Fragment>
      <FormControl>
  <InputLabel htmlFor="my-input">Email address</InputLabel>
  <Input id="my-input" aria-describedby="my-helper-text" />
  <FormHelperText id="my-helper-text">We'll never share your email.</FormHelperText>
</FormControl>
    </React.Fragment>
  );
}
