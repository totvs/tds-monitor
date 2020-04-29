import * as React from "react";
import Typography from "@material-ui/core/Typography";
import { Link, ListItem, List } from "@material-ui/core";

interface ITextPanelProps {
  onNewServer: any;
  onConnectServer: any;
  onShowMonitor: any;
}

export default function TextPanel(props: ITextPanelProps) {

  return (
    <React.Fragment>
      <Typography variant="subtitle2" component="h3">
        <strong>Começar</strong>
      </Typography>
      <List>
        <ListItem>
          <Link href="#" onClick={props.onNewServer}>
            Novo servidor...
          </Link>
        </ListItem>
        <ListItem>
          <Link href="#" onClick={props.onConnectServer}>
            Conectar a um servidor...
          </Link>
        </ListItem>
        <ListItem>
          <Link href="#" onClick={props.onShowMonitor}>
            Monitorar
          </Link>
        </ListItem>
      </List>
    </React.Fragment>
  );
}
