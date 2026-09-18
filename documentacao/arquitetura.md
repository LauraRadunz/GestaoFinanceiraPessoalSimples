# Arquitetura — Finanças App

## Visão geral
O aplicativo usa roteamento por arquivos (Expo Router), telas e
componentes em português, e uma camada de serviços que fala diretamente
com o Firebase Firestore. O único estado global de verdade é o **perfil
ativo** (`PerfilContexto`) — o resto de cada tela busca seus próprios
dados quando é aberta, via escuta em tempo real (`onSnapshot`).

```
app/                (rotas — Expo Router; cada arquivo = 1 tela)
   │  importa e renderiza
   ▼
src/telas/          (lógica e layout de cada tela)
   │  usa
   ▼
src/componentes/    (peças de UI reutilizáveis: cartões, cabeçalho, dropdown, barra de progresso)

src/telas/ também chama diretamente:
   ▼
src/services/       (um arquivo por entidade: listar, escutar, adicionar, atualizar, remover)
   │  usa
   ▼
src/services/firebase.ts   (conexão com o Firestore e com o Firebase Authentication)

src/contexto/       (PerfilContexto — perfil ativo, único estado global do app)
src/hooks/          (useUsuarioAtual — estado de autenticação, usado no layout raiz)
src/utils/          (funções puras: cálculo de saldo/divisão de gastos, formatação, alertas — sem estado)
src/types/          (um arquivo por entidade, com o "formato" dos dados)
```

### Perfis: como os dados se relacionam
Diferente da primeira versão (um `usuarioId` direto em cada entidade), o
app organiza os dados em **perfis**. Regra geral: uma entidade nunca
referencia o usuário direto se já tem uma "mãe" mais específica na cadeia.

- **Perfil** é o único que referencia o usuário direto, via `membros: string[]`
  (quem tem acesso) e `donoId` (quem criou). Todo usuário nasce com um
  perfil **"Pessoal"** (`tipo: 'principal'`) — o ID desse documento é o
  próprio `uid` do usuário, de propósito: isso torna a criação idempotente
  (nunca duplica, não importa quantas vezes for chamada). Perfis
  **secundários** (ex.: "Casa") usam ID aleatório, já que um usuário pode
  ter vários, e podem ser compartilhados por e-mail (ver `ConviteService`).
- **Conta, Categoria, Meta** referenciam `perfilId` (a "mãe" direta). Só o
  perfil principal tem contas.
- **Lançamento, Orçamento** não têm `perfilId` próprio: o dono de verdade é
  a **categoria** (`categoriaId`). A tela descobre a que perfil pertencem
  buscando primeiro as categorias do perfil, depois os lançamentos/
  orçamentos daquelas categorias ("join" manual).
- **Transferência** não tem `perfilId`: a "mãe" é a conta de origem.
- **Lançamento** também pode ter `contaId` apontando para uma conta de
  OUTRO perfil (a conta principal de quem pagou) — é assim que um gasto
  lançado no perfil "Casa" desconta de verdade de uma conta pessoal. O
  saldo de uma conta, por isso, busca lançamentos por `contaId` (não por
  categoria).
- **`pagadorId`** em Lançamento guarda quem pagou de fato — usado no
  cálculo da divisão de gastos.
- **Repasse** referencia `perfilId` (o perfil secundário onde a dívida foi
  calculada), `deContaId` (conta de origem, sempre no perfil principal de
  quem envia) e, só depois de confirmado, `contaDestinoId` (conta de
  destino, no perfil principal de quem recebe) — esses dois campos servem
  só pra saber em qual `contaId` lançar a despesa/receita de verdade (ver
  seção "Divisão de gastos e repasses" abaixo); o saldo em si não olha
  pro Repasse, olha pros lançamentos que ele gera.
- **Convite** referencia `perfilId` e o e-mail de quem foi convidado; ao
  ser aceito, o `usuarioId` de quem aceitou entra no `membros` do perfil.

### Divisão de gastos e repasses
Num perfil secundário compartilhado (ex.: "Casa"), `calcularDivisaoDeGastos`
(em `utils/calculos.ts`) soma as despesas do perfil, divide igualmente
pelo número de membros e calcula, para cada um, `pago - cota` (positivo =
a receber, negativo = deve). A partir desses saldos, `calcularAcertos`
monta a lista mínima de "fulano paga tanto para beltrano" que fecha a
conta — um algoritmo guloso de casamento entre quem deve mais e quem tem
mais a receber.

Para permitir que essas dívidas sejam realmente pagas **dentro do app**
(sem precisar de anotação externa), existe a entidade **Repasse**. A
decisão de design importante aqui: um repasse **não tem cálculo de saldo
próprio** — ele se resolve inteiramente através de dois lançamentos de
verdade, um em cada ponta, reaproveitando tudo que já existe pra saldo de
conta e histórico:
1. Quem deve escolhe, na tela de Lançamentos, de qual conta própria
   (perfil principal) o dinheiro saiu, o valor e a **data**, e confirma.
   `RepasseService.enviarRepasse` grava o repasse como `pendente` e, ao
   mesmo tempo, lança de verdade uma **despesa** no perfil principal de
   quem enviou (categoria "Repasses enviados", criada sob demanda por
   `CategoriaService.garantirCategoriaRepasse` — mesmo truque de ID
   determinístico do perfil "Pessoal", pra nunca duplicar essa categoria).
   É essa despesa — um lançamento comum, indistinguível de qualquer
   outro — que desconta o valor da conta; `calcularSaldoConta` não sabe
   nem precisa saber que existe repasse.
2. `calcularDivisaoDeGastos` recebe, à parte, a lista de repasses do
   perfil e desconta o que já foi enviado/recebido do saldo de cada
   membro — assim a dívida já paga para de aparecer como pendente na
   divisão, mesmo que quem recebeu ainda não tenha confirmado o
   recebimento. Essa é a única conta que os repasses ainda influenciam
   "por fora" de um lançamento — de propósito: a divisão de gastos
   acontece dentro do perfil secundário, e a despesa/receita do repasse
   fica no perfil principal de cada um, então não dá pra simplesmente
   somar lançamentos aqui.
3. Quem recebe vê, no Painel, uma "caixinha" com os repasses `pendentes`
   destinados a ele (`escutarRepassesPendentesPara`), escolhe em qual
   conta própria o valor entrou e a data em que caiu. Só então
   `RepasseService.receberRepasse` lança de verdade uma **receita** no
   perfil principal de quem recebeu (categoria "Repasses recebidos",
   mesma lógica de criação sob demanda) e marca o repasse como `recebido`.

Essa divisão em duas etapas (a despesa é lançada na hora; a receita só
quando confirmada) existe porque o app não tem como saber automaticamente
em qual conta o dinheiro caiu do lado de quem recebeu (pode ter sido Pix,
dinheiro em mãos, outro banco) — só que ele efetivamente saiu da conta de
quem enviou, e isso já pode virar histórico de verdade na hora.

### Autenticação e proteção de rotas
O app usa **Firebase Authentication** (e-mail/senha). O acesso aos dados é
controlado pela pertença a um perfil (`membros`), não por um campo direto
em cada entidade — ver seção anterior.

**Como a proteção de rotas funciona (e por que não é no `_layout.tsx`):**
No Expo Router, todo arquivo dentro de `app/` é uma rota válida só por
existir — mesmo que ele não seja listado como `<Stack.Screen>` no layout.
Ou seja, **não dá para "esconder" uma rota condicionalmente no layout**;
se o usuário acessar `/contas` diretamente (ou o app tentar renderizar
essa tela), o arquivo `app/contas.tsx` é executado de qualquer forma.
Por isso, cada tela que exige login (`TelaContas`, `TelaLancamentos` etc.)
verifica sozinha, logo no início do componente, se há um usuário logado
(`useUsuarioAtual()`) e usa `<Redirect href="/login" />` do Expo Router
caso não haja — isso força a navegação de verdade para a tela de login,
em vez de deixar a tela "presa" esperando dados que nunca chegam.
Pelo mesmo motivo, as ações de login, cadastro e logout chamam
`router.replace(...)` explicitamente após terminar, em vez de confiar que
o app vai "trocar de tela sozinho" só porque o estado de autenticação mudou.

### Escuta em tempo real (`onSnapshot`) e cache local
Cada serviço expõe, além das funções de CRUD, uma função `escutarX`
(ex.: `escutarContas`), que usa `onSnapshot` do Firestore em vez de
`getDocs`. Diferença importante: `getDocs` busca os dados **uma vez**;
`onSnapshot` "escuta" a coleção e chama o callback de novo automaticamente
sempre que algo muda — seja por uma ação do próprio usuário (criar, editar,
excluir) ou por outra pessoa (ex.: um membro do perfil "Casa" lançando um
gasto). As telas usam essa função dentro de um `useEffect`, guardando a
função de cancelamento que ela retorna para parar de escutar quando a tela
é desmontada:
```ts
useEffect(() => {
  const cancelar = escutarContas(perfilId, setContas);
  return cancelar; // roda quando a tela fecha
}, [perfilId]);
```
O Firestore é inicializado (`services/firebase.ts`) com **cache local
persistente** (`persistentLocalCache`, com `persistentMultipleTabManager`
para permitir testar duas contas em abas normais diferentes do mesmo
navegador): isso faz o `onSnapshot` responder na hora com o que já tinha
salvo, mesmo antes do servidor confirmar ou mesmo offline, em vez de
esperar um round-trip de rede a cada reload da página.

## Camadas

### 1. Rotas — `app/`
Cada arquivo dentro de `app/` vira uma rota automaticamente (Expo Router),
com base no **nome do arquivo**. Os arquivos aqui são propositalmente
"finos" — só importam e reexportam a tela correspondente de `src/telas/`:
```ts
import TelaContas from '../src/telas/TelaContas';
export default TelaContas;
```
Isso mantém a lógica de navegação (`app/`) separada da lógica de UI
(`src/telas/`). `app/_layout.tsx` envolve todas as rotas num
`<PerfilProvider>`, tornando o perfil ativo acessível em qualquer tela.

### 2. Contexto — `src/contexto/`
`PerfilContexto.tsx` é o único estado global do app: guarda a lista de
perfis do usuário logado e qual está ativo no momento, e contém a
autocorreção que garante que todo usuário logado sempre acabe com um
perfil "Pessoal" (mesmo contas antigas órfãs).

### 3. Telas — `src/telas/`
Cada tela cuida de: buscar os dados necessários (via `services/`) quando é
aberta, escopados pelo perfil ativo (`usePerfilAtual()`), manter o estado
local do formulário, chamar o serviço certo ao salvar/editar/excluir. Como
tudo usa `onSnapshot`, não existe uma função "recarregar" manual — a lista
atualiza sozinha.

### 4. Componentes — `src/componentes/`
Pedaços de UI reaproveitados entre telas: `Cabecalho` (título + subtítulo),
`Cartao*` (um cartão por entidade: conta, categoria, lançamento, meta),
`BarraProgresso` (usada em Metas e Orçamento).

### 5. Serviços — `src/services/`
Um arquivo por entidade (ex: `ContaService.ts`, `PerfilService.ts`,
`RepasseService.ts`), cada um com funções de CRUD e escuta. Por baixo,
cada função chama o Firestore através de `services/firebase.ts`. Essa é a
**única** camada que conhece o Firestore — as telas nunca chamam o
Firestore diretamente.

### 6. Tipos — `src/types/`
Um arquivo por entidade, com o formato dos dados em TypeScript (`Conta`,
`Categoria`, `Lancamento`, `Transferencia`, `Meta`, `Orcamento`, `Perfil`,
`Convite`, `Repasse`).

### 7. Utilitários — `src/utils/`
Funções puras sem estado: `calculos.ts` (saldo por conta, saldo total,
resumo do mês, progresso de meta/orçamento, divisão de gastos e acertos),
`formato.ts` (formatação de moeda e data), `alerta.ts` (alertas compatíveis
com celular e navegador) e `limiteDeTempo.ts` (dispara escritas sem
travar a UI esperando confirmação do servidor).

## Padrão de nomenclatura
- Pastas em minúsculo (`telas`, `componentes`, `services`, `utils`, `types`, `contexto`);
- Telas com prefixo `Tela` em `PascalCase` (ex: `TelaContas.tsx`);
- Componentes com prefixo do que representam (ex: `CartaoConta.tsx`);
- Serviços com sufixo `Service` (ex: `ContaService.ts`), funções em
  `camelCase` com verbo em português (`listar`, `adicionar`, `atualizar`,
  `remover`, `escutar`, `enviar`, `receber`);
- Variáveis de estilo chamadas `estilos` (não `styles`);
- Tipos/interfaces em `PascalCase`, no singular (ex: `Conta`, `Lancamento`, `Repasse`).

## Por que essa arquitetura?
A combinação Expo Router + Firebase + serviço por entidade, estendida com
a ideia de "mãe mais próxima" para organizar dados compartilhados entre
várias pessoas, evita duplicar informação e dar acesso indevido a dados
de outros perfis. Cada camada e cada relação entre entidades tem uma
responsabilidade única, o que facilita tanto a manutenção quanto explicar
o funcionamento do sistema.
