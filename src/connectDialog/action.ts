export interface IConnectDialogAction {
  action: ConnectDialogAction;
  content: any;
}

export enum ConnectDialogAction {
  Close,
  UpdateModel,
  SaveAndClose,
  UpdateWeb
}
