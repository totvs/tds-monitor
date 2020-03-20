export interface ICommand {
  action: CommandAction;
  content: any;
}

export enum CommandAction {
  _Save,
  ValidConnection,
  UpdateProperty,
  UpdateState
}
