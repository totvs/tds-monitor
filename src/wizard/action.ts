export interface IWizardAction {
  action: WizardAction;
  content: any;
}

export enum WizardAction {
  Save,
  UpdateWizard,
  Validate
}
