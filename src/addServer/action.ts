export interface IAddServerAction {
  action: AddServerAction;
  content: any;
}

export enum AddServerAction {
  Save,
  UpdateWizard,
  Validate
}
