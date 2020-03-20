import * as React from "react";
import Typography from "@material-ui/core/Typography";
import { Link, ListItem, List } from "@material-ui/core";

export default function TextPanel() {
  const newServer = () => {};
  const connectServer = () => {};
  const showMonitor = () => {};

  return (
    <React.Fragment>
      <Typography variant="subtitle2" component="h3">
        Começar
      </Typography>
      <List>
        <ListItem>
          <Link href="#" onClick={newServer}>
            Novo servidor...
          </Link>
        </ListItem>
        <ListItem>
          <Link href="#" onClick={connectServer}>
            Conectar a um servidor...
          </Link>
        </ListItem>
        <ListItem>
          <Link href="#" onClick={showMonitor}>
            Monitorar
          </Link>
        </ListItem>
      </List>
    </React.Fragment>
  );
}
