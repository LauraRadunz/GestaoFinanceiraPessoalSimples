# Interface e Identidade Visual — Finanças App

## Paleta de cores

| Uso | Cor | Hex |
|-----|-----|-----|
| Fundo das telas | Branco | `#FFFFFF` |
| Ação primária / destaque positivo | Verde | `#2ECC71` |
| Ação secundária / navegação | Azul | `#2E7D9E` |
| Despesa / exclusão / alerta | Vermelho | `#E05C5C` |
| Texto principal | Cinza-escuro | `#222222` |
| Texto secundário | Cinza-médio | `#666666` |
| Bordas / divisores | Cinza-claro | `#E0E0E0` |
| Fundo de cartões | Cinza bem claro | `#F5F5F5` |
| Fundo do cartão de convite/aviso | Amarelo bem claro | `#FFF6E5` |
| Fundo do cartão de "caixinha" (repasse recebido) | Verde bem claro | `#E7F5EC` |

## Tipografia
- Fonte padrão do sistema (sem fontes customizadas).
- Títulos de tela (`Cabecalho`): 24px, bold.
- Subtítulos: 14px, cor secundária.
- Títulos de seção: 16px, bold.
- Texto padrão: 14px, regular.
- Valores monetários em destaque: 18–24px, bold.

## Diretrizes gerais de UI
- Tema claro (fundo branco).
- Cada tela de cadastro (Contas, Categorias, Lançamentos, Transferências, Metas,
  Orçamento) segue o mesmo padrão: **formulário no topo + lista logo abaixo**,
  na mesma tela — sem navegar para uma tela separada de formulário.
- Cartões (`Cartao*`) com cantos arredondados (8px), fundo cinza claro, e uma
  borda lateral colorida para indicar categoria/tipo quando fizer sentido.
- Verde para receitas/valores positivos/dinheiro recebido, vermelho para
  despesas/exclusão/dívida pendente, azul para ações neutras de navegação.
- Botões de ação primária sempre visíveis, com texto em maiúsculo-semântico
  claro ("Salvar conta", "Salvar lançamento", "Confirmar envio").
- Alertas de confirmação (excluir) e erro (campo obrigatório) usam o utilitário
  `utils/alerta.ts`, compatível com celular e navegador (web).
- Sempre que o usuário precisa escolher **uma opção entre várias já
  cadastradas** (conta de origem/destino numa transferência, grupo de uma
  categoria), a interface usa um dropdown nativo (`componentes/SeletorDropdown.tsx`)
  em vez de uma lista de botões — mais claro quando a lista de opções cresce.
  Quando a lista de opções normalmente é curta e fixa (tipo de conta,
  receita/despesa, escolha de conta própria num acerto/repasse), mantemos os
  botões/chips de seleção, que deixam todas as opções visíveis de uma vez.

## Perfis, divisão de gastos e repasses
- **Seletor de perfil**: chips horizontais no topo do Painel — o perfil ativo
  fica preenchido em azul (`#2E7D9E`), os demais com borda cinza. Um link
  "Gerenciar perfis" leva à tela de criar/convidar/trocar.
- **Convites pendentes**: cartão de fundo amarelo claro (`#FFF6E5`) no
  Painel, com um botão verde "Aceitar" e um vermelho "Recusar" por convite.
- **Divisão de gastos** (tela de Lançamentos, perfil secundário com mais de
  um membro): cartão cinza claro com o saldo de cada membro (verde = a
  receber, vermelho = deve) e, abaixo, a lista "Pra fechar a conta" com
  cada acerto pendente.
- **"Marcar como enviado"**: link em azul ao lado de um acerto pendente que
  é do usuário logado (`deUsuarioId === usuarioId`). Abre um formulário
  inline (fundo branco, borda cinza) com chips das contas próprias e um
  campo de valor pré-preenchido com o valor sugerido e um campo de data
  (padrão "hoje") — mantendo o padrão
  de "tudo na mesma tela", sem navegar para outra rota.
- **"Caixinha" de repasse recebido** (Painel): cartão de fundo verde bem
  claro (`#E7F5EC`), mostrando "Você recebeu [valor] de [nome]" e chips
  para escolher a conta de destino antes de confirmar — reforça
  visualmente que é dinheiro entrando (mesma família de verde usada para
  receitas), mas ainda pendente de uma ação da pessoa.
