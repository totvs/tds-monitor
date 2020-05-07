export interface IWelcomePageAction {
  action: WelcomePageAction;
  content: any;
  arg?: any;
}

export enum WelcomePageAction {
  Save,
  ExecuteCommand
}
