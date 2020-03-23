import * as React from "react";

import { IMonitorItem } from "../../monitorInterfaces";
import ErrorBoundary from "../../helper/errorBoundary";
import MonitorTheme from "../../helper/theme";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import CancelIcon from "@material-ui/icons/Cancel";
import DoneIcon from "@material-ui/icons/Done";

import {
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  BottomNavigation,
  BottomNavigationAction,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Checkbox,
  FormControl,
  FormHelperText
} from "@material-ui/core";
import { IAddServerAction, AddServerAction } from "../action";

interface IAddServerWizardProps {
  vscode: any;
  monitorItem: IMonitorItem;
}

const steps = [
  "Tipo da Aplicação",
  "Informações para Acesso",
  "Verificação e Confirmação"
];

export default function AddServerWizard(props: IAddServerWizardProps) {
  const [activeStep, setActiveStep] = React.useState(0);
  const [state, setState] = React.useState<IMonitorItem>(props.monitorItem);

  const handleReset = () => {
    setActiveStep(0);
  };

  const updateModel = (data: any) => {
    let command: IAddServerAction = {
      action: AddServerAction.UpdateModel,
      content: data
    };

    props.vscode.postMessage(command);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const name = target.name;
    const value =
      target.type === "checkbox"
        ? target.checked
        : //  : target.type === "number"
          //  ? parseInt(target.value)
          target.value;
    const oldValue = state[name];

    if (value !== oldValue) {
      const data = { ...state, [name]: value };

      setState(data);
      updateModel(data);
    }
  };

  const loadSmartClient = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Array.from(event.target.files).forEach(file => {
    //   getFileFromInput(file as File)
    //     .then((content: string) => {
    //       const parseIni = ini.parse(content);
    //       const drivers = getIniProp(parseIni, "drivers");
    //       const active = getIniProp(drivers, "active");
    //       const config = getIniProp(parseIni, active);
    //       const address = getIniProp(config, "server");
    //       const port = getIniProp(config, "port");
    //       setStateForm({
    //         ...stateForm,
    //         address: address,
    //         port: parseInt(port)
    //       });
    //       //setServer({ ...server, address: address, port: parseInt(port) });
    //     })
    //     .catch(function(reason) {
    //       console.log(`Error during upload ${reason}`);
    //     });
    // });
  };

  const selectServerType = () => {
    return (
      <React.Fragment>
        <FormControl component="fieldset" required>
          <FormLabel component="legend">Aplicação Servidora</FormLabel>
          <RadioGroup
            aria-label="type"
            name="type"
            value={state.type}
            onChange={handleChange}
          >
            <FormControlLabel
              value="protheus"
              control={<Radio />}
              label="Protheus"
            />
            <FormControlLabel
              value="loginc"
              control={<Radio />}
              label="Logix"
            />
            <FormHelperText>
              Selecione qual o tipo de aplicação servidora ao qual deseja
            </FormHelperText>
          </RadioGroup>
        </FormControl>
      </React.Fragment>
    );
  };

  const getConnectionInfo = (readOnly: boolean) => {
    return (
      <React.Fragment>
        <TextField name="type" label="Tipo" value={state.type} disabled />
        <TextField
          name="smartClient"
          label="SmartClient"
          value={state.smartClient}
          helperText="Arquivo de configuração SmartClient."
          type="file"
          InputProps={{
            readOnly: readOnly
          }}
          onChange={loadSmartClient}
        />
        <TextField
          name="name"
          label="Nome"
          required
          value={state.name}
          helperText="Informe o nome para identificação do registro."
          InputProps={{
            readOnly: readOnly
          }}
          onChange={handleChange}
        />
        <TextField
          name="address"
          label="Endereço"
          required
          value={state.address}
          helperText="Informe o nome ou endereço IP da aplicação servidora."
          InputProps={{
            readOnly: readOnly
          }}
          onChange={handleChange}
        />
        <TextField
          name="port"
          label="Porta"
          required
          type="number"
          value={state.port}
          helperText="Informe a porta de conexão. Normalmente é a mesma do SmartClient."
          InputProps={{
            readOnly: readOnly
          }}
          onChange={handleChange}
        />
        <FormControlLabel
          name="secure"
          disabled
          control={<Checkbox checked={state.secure} value="ssl" />}
          label="Conexão segura (SSL)"
          onChange={handleChange}
        />
      </React.Fragment>
    );
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return selectServerType();

      case 1:
        return getConnectionInfo(false);

      default:
        break;
    }

    return <Typography>{step}</Typography>;
  };

  return (
    <React.Fragment>
      <ErrorBoundary>
        <MonitorTheme>
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => {
              const stepProps: { completed?: boolean } = {};
              const labelProps: { optional?: React.ReactNode } = {};
              return (
                <Step key={label} {...stepProps}>
                  <StepLabel {...labelProps}>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
          {activeStep === steps.length ? (
            <div>
              <Typography>
                All steps completed - you&apos;re finished
              </Typography>
              <Button onClick={handleReset}>Reset</Button>
            </div>
          ) : (
            <React.Fragment>
              {getStepContent(activeStep)}
              <BottomNavigation
                value={activeStep}
                showLabels
                onChange={(event, newValue) => {
                  if (newValue !== 0) {
                    setActiveStep(prevActiveStep => prevActiveStep + newValue);
                  }
                }}
              >
                <BottomNavigationAction
                  label="Back"
                  disabled={activeStep === 0}
                  value={-1}
                  icon={<NavigateBeforeIcon />}
                />
                <BottomNavigationAction
                  label={activeStep === steps.length - 1 ? "Finish" : "Next"}
                  value={1}
                  icon={
                    activeStep === steps.length - 1 ? (
                      <DoneIcon />
                    ) : (
                      <NavigateNextIcon />
                    )
                  }
                />
                <BottomNavigationAction
                  label="Cancel"
                  value={0}
                  icon={<CancelIcon />}
                />
              </BottomNavigation>
            </React.Fragment>
          )}
        </MonitorTheme>
      </ErrorBoundary>
    </React.Fragment>
  );
}
