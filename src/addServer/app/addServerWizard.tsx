import * as React from "react";

import { IMonitorItem } from "../../monitorInterfaces";
import ErrorBoundary from "../../helper/errorBoundary";
import MonitorTheme from "../../helper/theme";
import {
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  BottomNavigation,
  BottomNavigationAction
} from "@material-ui/core";

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
  // const [stateForm, setStateForm] = React.useState<IMonitorItem>(props.monitorItem);

  const handleReset = () => {
    setActiveStep(0);
  };

  const getStepContent = (step: number) => {
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
                />
                <BottomNavigationAction
                  label={activeStep === steps.length - 1 ? "Finish" : "Next"}
                  value={1}
                  color="prymary"
                />
                <BottomNavigationAction
                label="Cancel"
                value={0} />
              </BottomNavigation>
            </React.Fragment>
          )}
        </MonitorTheme>
      </ErrorBoundary>
    </React.Fragment>
  );
}
