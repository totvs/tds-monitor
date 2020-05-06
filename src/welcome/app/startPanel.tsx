import * as React from "react";

import {
  Link,
  ListItem,
  List,
  MenuItem,
  Select,
  Card,
  CardHeader,
  CardContent,
  Avatar
} from "@material-ui/core";

interface IStartPanelProps {
  onNewServer: any;
  onConnectServer: any;
  servers: string[];
}

export default function StartPanel(props: IStartPanelProps) {
  const handleConnectChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    event.preventDefault();

    props.onConnectServer(event.target.value);
  };

  return (
    <Card variant="outlined" style={{height: 280}}>
      <CardHeader
        title="Vamos Começar?"
        subheader="Passos iniciais para usar o monitor."
        avatar={
          <Avatar aria-label="recipe">
            V
          </Avatar>
        }
      />

      <CardContent>
        <List>
          <ListItem>
            <Link
              href="#"
              onClick={() => {
                props.onNewServer();
              }}
            >
              Novo servidor...
            </Link>
          </ListItem>

          <ListItem disabled={props.servers.length === 0}>
            <Link href="#">
              Conectar ao servidor
              <Select value="" onChange={handleConnectChange}>
                {props.servers.map((option) => (
                  <MenuItem value={option}>{option}</MenuItem>
                ))}
              </Select>
            </Link>
          </ListItem>

        </List>
      </CardContent>
    </Card>
  );
}
