# TOTVS Developer Studio Monitor

# Essa é uma versão BETA do produto, que não deve ser usada em produção.

## Este plugin será incorporado ao plugin abaixo até o final do mes de Julho/2020:

[Totvs Developer Studio for VSCode (AdvPL, TLPP e 4GL)](https://marketplace.visualstudio.com/items?itemName=totvs.tds-vscode)

O plugin do TOTVS Developer Studio Monitor disponibiliza as funcionalidades do antigo Totvs Monitor dentro do VScode.
Ele utiliza os protocolos de comunicação LSP (Language Server Protocol) que é extensível à outras IDEs de mercado, como Atom, Visual Studio, Eclipse, Eclipse Theia, Vim e Emacs.

> [Lista de IDEs com suporte ao LSP](https://microsoft.github.io/language-server-protocol/implementors/tools).
[Lista de IDEs com suporte ao DAP](https://microsoft.github.io/debug-adapter-protocol/implementors/tools).

## Funcionalidades

* Adicionar Servidor.
* Conectar a um servidor.
* Desconectar de um servidor.
* Listar usuarios conectados.
* Apresentar informações da conexão em uma View HTML.
* etc (Lista de funcionalidades do Totvs Monitor) (Em Desenvolvimento)

### Cadastro de servidores utilizando o assistente

* Clique no icone `"+"` no canto superior direito da visão, ao lado da aba `Servidores`.
* Preencha as informações de `nome`, `ip` e `porta` do Servidor.
* Clique no botão `Salvar`.

### Conexão com servidores

* Após executar o cadastro de ao menos um servidor.
* Vá para visão de monitores (Acesso pelo ícone da TOTVS na lateral esquerda do VSCode).
* Clique com o botão direito e selecione a opção `Connect`.
* Informe `ambiente`, `usuário` e `senha` (pode ser "em branco") para prosseguir.
* Aguarde o termino da conexão.

### Apresentação de informações

* Após conectar a um servidor.
* Clique com o botão direito no servidor e selecione a opção `Show Infos`.
* Essa opção irá abrir uma página HTML com as informações de monitor.

## Problemas Conhecidos

* Falta de atualização e de comandos na visão.
