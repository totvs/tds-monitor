import * as React from "react";
import Typography from "@material-ui/core/Typography";
import { Card, CardHeader, CardContent, Avatar } from "@material-ui/core";

export default function InfoPanel() {
  return (
    <Card variant="outlined">
      <CardHeader
        title="Informações"
        subheader="Informações importantes sobre a extensão."
        avatar={<Avatar aria-label="recipe">I</Avatar>}
      />

      <CardContent>
        <Typography>
          As informações sobre servidores registrados são armazenados em um
          arquivo no formato <i>JSON</i>. Se, além do
          <strong>TOTVS Monitor</strong>, você tiver o
          <strong>TDS for VSCode</strong> instalado, você poderá utilizar o
          arquivo de definição do <strong>TDS</strong>. Assim, a lista de servidores registrados
          será compartilhada entre as extensões.
        </Typography>
        <Typography>
          Ajuste qual usar na opção apropriada do painel
          <i>Configurações</i> ou no arquivo de configurações do <strong>VS Code</strong>. Por
          compatibilidade com versões anteriores do <strong>TOTVS Monitor</strong>, este vem
          configurado para usar o arquivo próprio por padrão.
        </Typography>
      </CardContent>
    </Card>
  );
}
