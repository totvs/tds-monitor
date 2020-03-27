export interface IAddServerAction {
  action: AddServerAction;
  content: any;
}

export enum AddServerAction {
  UpdateWeb,
  UpdateModel,
  SaveAndClose,
  Close,
  SelectSmartClient
}
