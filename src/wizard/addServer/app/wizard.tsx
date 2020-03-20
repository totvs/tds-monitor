import * as React from "react";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { myVscode } from "./addServerWizard";
import * as ini from "ini";

import {
  FormLabel,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  TextField,
  Checkbox
} from "@material-ui/core";
import { IMonitorItem } from "../../../monitorInterfaces";
import { IWizardAction, WizardAction } from "../../action";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%"
    },
    button: {
      marginRight: theme.spacing(1)
    },
    instructions: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1)
    },
    inputNone: {
      display: "none"
    }
  })
);

export default function Wizard(newServer) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const [stateForm, setStateForm] = React.useState(newServer as IMonitorItem);

  const steps = [
    "Tipo da Aplicação",
    "Informações para Acesso",
    "Verificação e Confirmação"
  ];

  const handleNext = () => {
    setActiveStep(prevActiveStep => {
      return prevActiveStep + 1;
    });
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const getFileFromInput = (file: File): Promise<any> => {
    return new Promise(function(resolve, reject) {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = function() {
        resolve(reader.result);
      };
      reader.readAsText(file);
    });
  };

  const getIniProp = (s: any, target: string): any => {
    for (const key in s) {
      if (key?.toLowerCase() === target?.toLowerCase()) {
        return s[key];
      }
    }
    return null;
  };

  const loadSmartClient = (event: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(event.target.files).forEach(file => {
      getFileFromInput(file as File)
        .then((content: string) => {
          const parseIni = ini.parse(content);
          const drivers = getIniProp(parseIni, "drivers");
          const active = getIniProp(drivers, "active");
          const config = getIniProp(parseIni, active);
          const address = getIniProp(config, "server");
          const port = getIniProp(config, "port");

          setStateForm({
            ...stateForm,
            address: address,
            port: parseInt(port)
          });
          //setServer({ ...server, address: address, port: parseInt(port) });
        })
        .catch(function(reason) {
          console.log(`Error during upload ${reason}`);
        });
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const name = target.name;
    const value =
      target.type === "checkbox"
        ? target.checked
        : target.type === "number"
        ? parseInt(target.value)
        : target.value;
console.log(target);
console.log(name);
console.log(value);

    setStateForm({ ...stateForm, [name]: value });
    // setServer({ ...server, [name]: value });
  };

  const selectServerType = () => {
    return (
      <div>
        <FormLabel component="legend">
          Selecione o tipo da aplicação servidora
        </FormLabel>
        <RadioGroup name="type" value={stateForm.type} onChange={handleChange}>
          <FormControlLabel
            value="protheus"
            control={<Radio />}
            label="Protheus"
          />
          <FormControlLabel value="logix" control={<Radio />} label="Logix" />
          <FormControlLabel
            value="dbaccess"
            control={<Radio />}
            label="DBAccess"
          />
        </RadioGroup>
      </div>
    );
  };

  const getConnectionInfo = (readOnly: boolean) => {
    return (
      <div>
        <TextField
          name='type'
          label="Tipo"
          value={stateForm.type}
          disabled
        />
        <TextField
          name='smartClient'
          label="SmartClient"
          value={stateForm.smartClient}
          helperText="Arquivo de configuração SmartClient."
          type="file"
          size="small"
          InputProps={{
            readOnly: readOnly
          }}
          onChange={loadSmartClient}
        />
        <TextField
        name='name'
          label="Nome"
          required
          value={stateForm.name}
          helperText="Informe o nome para identificação do registro."
          InputProps={{
            readOnly: readOnly
          }}
          onChange={handleChange}
        />
        <TextField
        name='address'
          label="Endereço"
          required
          value={stateForm.address}
          helperText="Informe o nome ou endereço IP da aplicação servidora."
          InputProps={{
            readOnly: readOnly
          }}
          onChange={handleChange}
        />
        <TextField
        name='port'
          label="Porta"
          required
          type="number"
          value={stateForm.port}
          helperText="Informe a porta de conexão. Normalmente é a mesma do SmartClient."
          InputProps={{
            readOnly: readOnly
          }}
          onChange={handleChange}
        />
        <FormControlLabel
        name='secure'
          disabled
          control={<Checkbox checked={stateForm.secure} value="ssl" />}
          label="Conexão segura (SSL)"
          onChange={handleChange}
        />
      </div>
    );
  };

  const testConnection = () => {
    return (
      <TextField
      name='buildVersion'
        label="Versão"
        helperText="Versão do servidor registrado."
        disabled
        value={stateForm.buildVersion}
        onChange={handleChange}
      />
    );
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <FormControl component="fieldset">{selectServerType()}</FormControl>
        );
      case 1:
        return (
          <FormControl component="fieldset">
            {getConnectionInfo(false)}
          </FormControl>
        );
      case 2:
        return (
          <FormControl component="fieldset">
            {getConnectionInfo(true)}
            {testConnection()}
          </FormControl>
        );
      default:
        return "Unknown step";
    }
  };

  if (activeStep === 2) {
    let command: IWizardAction = {
      action: WizardAction.Validate,
      content: stateForm
    };
    myVscode.postMessage(command);
  }

  return (
    <div className={classes.root}>
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
      <div>
        {activeStep === steps.length ? (
          <div>
            <Typography className={classes.instructions}>
              All steps completed - you&apos;re finished
            </Typography>
            <Button onClick={handleReset} className={classes.button}>
              Reset
            </Button>
          </div>
        ) : (
          <div>
            <Typography className={classes.instructions}>
              {getStepContent(activeStep)}
            </Typography>
            <div>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                className={classes.button}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                className={classes.button}
              >
                {activeStep === steps.length - 1 ? "Finish" : "Next"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
