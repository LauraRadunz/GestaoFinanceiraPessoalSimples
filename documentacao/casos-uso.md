# Casos de Uso — Finanças App

**Ator principal:** Usuário (dono das finanças)

---

## UC00 — Cadastrar-se e Entrar
**Ator:** Usuário (novo ou já cadastrado)
**Pré-condições:** Nenhuma.
**Fluxo principal (cadastro):**
1. Usuário abre o app pela primeira vez e é direcionado para a tela de Login.
2. Usuário toca em "Não tem conta? Cadastre-se".
3. Usuário informa nome, e-mail e senha (com confirmação).
4. Sistema cria a conta no Firebase Authentication e loga o usuário
   automaticamente.
5. Sistema cria automaticamente o perfil "Pessoal" (tipo principal) do
   usuário (ver UC11) e direciona para o Painel.

**Fluxo principal (login):**
1. Usuário informa e-mail e senha cadastrados e toca em "Entrar".
2. Sistema autentica e direciona para o Painel.

**Fluxos alternativos:**
- 3a. E-mail já cadastrado, senha curta (menos de 6 caracteres), ou senhas
  não conferem: sistema exibe alerta específico e mantém os dados
  preenchidos.
- 1a. E-mail ou senha incorretos no login: sistema exibe alerta genérico
  ("E-mail ou senha incorretos"), sem indicar qual dos dois está errado
  (por segurança).
- Usuário logado pode tocar em "Sair" no Painel a qualquer momento,
  encerrando a sessão e voltando para a tela de Login.

**Observação importante:** a partir deste caso de uso, todos os demais
(UC01 em diante) passam a ter como pré-condição adicional "usuário
autenticado". Os dados ficam isolados por **perfil** (ver UC11) — um
usuário só enxerga os perfis a que pertence, e dentro de cada perfil só
enxerga os dados daquele perfil.

---

## UC01 — Cadastrar Conta
**Ator:** Usuário
**Pré-condições:** Usuário está na tela "Contas", com o perfil "Pessoal"
(principal) ativo — apenas o perfil principal tem contas de dinheiro.
**Fluxo principal:**
1. Usuário preenche o formulário no topo da tela (nome, tipo, saldo inicial).
2. Usuário toca em "Salvar conta".
3. Sistema valida os dados e grava no Firestore, vinculada ao perfil principal ativo.
4. A lista de contas atualiza sozinha, exibindo a nova conta.

**Fluxos alternativos:**
- 3a. Nome em branco: sistema exibe alerta e mantém o formulário preenchido.
- Se o perfil ativo for secundário, a tela não mostra o formulário de contas
  e orienta o usuário a trocar para o perfil "Pessoal".

---

## UC02 — Editar/Excluir Conta
**Ator:** Usuário
**Pré-condições:** Existe ao menos uma conta cadastrada no perfil principal.
**Fluxo principal:**
1. Usuário toca em "Editar" no cartão da conta desejada.
2. Sistema preenche o formulário com os dados da conta.
3. Usuário altera e toca em "Salvar alterações".
4. Sistema atualiza o documento no Firestore; a lista atualiza sozinha.

**Fluxos alternativos:**
- 1a. Usuário toca em "Excluir": sistema pede confirmação; se confirmado, remove o documento.

---

## UC03 — Cadastrar Categoria
**Ator:** Usuário
**Pré-condições:** Usuário está na tela "Categorias", em qualquer perfil (principal ou secundário).
**Fluxo principal:**
1. Usuário preenche tipo (receita/despesa), grupo e nome da categoria.
2. Usuário toca em "Salvar categoria".
3. Sistema grava no Firestore, vinculada ao perfil ativo, e a lista atualiza
   sozinha, agrupada por grupo/tipo.

---

## UC04 — Registrar Lançamento (Receita/Despesa)
**Ator:** Usuário
**Pré-condições:** Existe ao menos uma categoria cadastrada no perfil ativo.
**Fluxo principal:**
1. Usuário seleciona tipo, categoria (cascata grupo → categoria), informa valor, data e descrição.
2. No perfil principal, usuário também escolhe de qual conta própria o valor
   sai. No perfil secundário, escolhe (se tiver) de qual conta do **seu
   próprio perfil principal** o valor sai — o gasto entra na divisão do
   perfil secundário mesmo que o usuário não tenha nenhuma conta cadastrada.
3. Usuário toca em "Salvar lançamento".
4. Sistema grava o lançamento no Firestore, com o usuário logado como
   pagador (`pagadorId`). A lista atualiza sozinha.

**Fluxos alternativos:**
- 3a. Valor inválido (zero ou negativo): sistema exibe alerta.
- 2a. Perfil principal sem nenhuma conta cadastrada: sistema orienta o
  usuário a cadastrar uma conta primeiro (ver UC01).

---

## UC05 — Editar/Excluir Lançamento
**Ator:** Usuário
**Pré-condições:** Existe ao menos um lançamento cadastrado no perfil ativo.
**Fluxo principal:**
1. Usuário toca em "Editar" no cartão do lançamento.
2. Sistema preenche o formulário; usuário altera e salva.
3. Sistema atualiza o documento no Firestore.

**Fluxos alternativos:**
- 1a. Usuário toca em "Excluir": sistema confirma e remove o lançamento.

---

## UC06 — Transferir entre Contas
**Ator:** Usuário
**Pré-condições:** Existem ao menos duas contas cadastradas no perfil principal ativo.
**Fluxo principal:**
1. Usuário seleciona conta de origem, conta de destino, valor e data.
2. Usuário toca em "Salvar transferência".
3. Sistema grava a transferência no Firestore.

**Fluxos alternativos:**
- 2a. Conta de origem igual à de destino: sistema impede e exibe alerta.

---

## UC07 — Visualizar Painel (Dashboard)
**Ator:** Usuário
**Pré-condições:** Usuário abre o aplicativo.
**Fluxo principal:**
1. Sistema busca, para o perfil ativo, as contas (se principal), lançamentos,
   transferências e repasses relacionados.
2. Sistema calcula localmente o saldo de cada conta, o saldo total e (se o
   perfil ativo for secundário e compartilhado) o resumo rápido da divisão
   de gastos do usuário logado.
3. Sistema exibe saldo total, saldo por conta, resumo de receitas/despesas
   do mês atual e, se houver, a "caixinha" de repasses recebidos aguardando
   escolha de conta (ver UC14).

---

## UC08 — Criar e Acompanhar Meta Financeira
**Ator:** Usuário
**Pré-condições:** Usuário está na tela "Metas", perfil principal ativo.
**Fluxo principal:**
1. Usuário informa nome, valor alvo, prazo e (opcionalmente) uma conta vinculada.
2. Usuário toca em "Salvar meta".
3. Sistema grava a meta e exibe o progresso (saldo atual da conta vinculada vs. valor alvo).

---

## UC09 — Definir e Acompanhar Orçamento por Categoria
**Ator:** Usuário
**Pré-condições:** Existe ao menos uma categoria de despesa cadastrada no perfil ativo.
**Fluxo principal:**
1. Usuário seleciona categoria e informa o valor planejado para o mês atual.
2. Usuário toca em "Salvar orçamento".
3. Sistema grava e exibe, para aquele mês, o valor planejado x valor realizado
   (somado a partir dos lançamentos daquela categoria).

**Fluxos alternativos:**
- 3a. Valor realizado ultrapassa o planejado: sistema destaca visualmente o excesso.

---

## UC10 — Filtrar e Buscar Lançamentos
**Ator:** Usuário
**Pré-condições:** Existem lançamentos cadastrados no perfil ativo.
**Fluxo principal:**
1. Usuário acessa a tela "Lançamentos".
2. Usuário aplica filtros (conta, tipo) e/ou digita um termo de busca.
3. Sistema exibe a lista filtrada (filtragem feita localmente, após buscar os dados do Firestore).

---

## UC11 — Gerenciar Perfis
**Ator:** Usuário
**Pré-condições:** Usuário autenticado.
**Fluxo principal (criar perfil secundário):**
1. Usuário acessa "Gerenciar perfis" a partir do Painel.
2. Usuário informa um nome (ex.: "Casa") e toca em "Criar perfil".
3. Sistema cria o perfil (tipo secundário), com o usuário como único membro.

**Fluxo principal (convidar):**
1. Usuário abre o convite por e-mail dentro de um perfil secundário que criou ou participa.
2. Usuário informa o e-mail da pessoa e confirma.
3. Sistema grava o convite (status "pendente") vinculado ao perfil e ao e-mail informado.
4. Quando a pessoa convidada faz login, o convite aparece no Painel dela
   (ver UC00): ela pode aceitar (entra como membro do perfil) ou recusar.

**Fluxo principal (trocar perfil ativo):**
1. Usuário toca em um dos chips de perfil, no topo do Painel.
2. Sistema troca o perfil ativo; as demais telas (Categorias, Lançamentos,
   Orçamento) passam a mostrar os dados desse perfil.

**Fluxos alternativos:**
- Todo usuário novo já nasce com um perfil "Pessoal" (tipo principal),
  criado automaticamente — não precisa ser criado manualmente.
- A criação do perfil "Pessoal" é idempotente: mesmo que disparada mais de
  uma vez, nunca duplica (o documento usa o próprio uid do usuário como ID).

---

## UC12 — Visualizar Divisão de Gastos
**Ator:** Usuário
**Pré-condições:** Perfil secundário ativo com mais de um membro; existem
lançamentos de despesa nesse perfil.
**Fluxo principal:**
1. Sistema soma todas as despesas do perfil e divide igualmente pelo número de membros (a "cota" de cada um).
2. Para cada membro, sistema calcula quanto ele pagou de verdade (via `pagadorId` dos lançamentos) e a diferença para a cota (a receber, se pagou mais; a dever, se pagou menos).
3. Sistema desconta dessas diferenças qualquer repasse já enviado/recebido entre os membros (ver UC13/UC14), pra não mostrar como pendente uma dívida que já foi paga.
4. Sistema calcula a lista mínima de "quem paga quanto para quem" que fecha a conta e exibe na tela de Lançamentos, junto com um resumo rápido no Painel.

---

## UC13 — Registrar Pagamento da Divisão (Repasse)
**Ator:** Usuário (quem deve, segundo UC12)
**Pré-condições:** Existe um "quem deve pagar quanto para quem" pendente
envolvendo o usuário logado, na tela de Lançamentos.
**Fluxo principal:**
1. Usuário toca em "Marcar como enviado" na linha do acerto que lhe diz respeito.
2. Usuário escolhe de qual das suas contas (perfil principal) o dinheiro saiu, ajusta o valor (pré-preenchido com o valor sugerido) e a data, e confirma.
3. Usuário toca em "Confirmar envio".
4. Sistema grava o repasse (status "pendente") e, ao mesmo tempo, lança de verdade uma **despesa** no perfil principal do usuário — categoria "Repasses enviados" (criada automaticamente na primeira vez), na conta e data informadas. Essa despesa é quem desconta o saldo, como qualquer outro lançamento.
5. A divisão de gastos (UC12) passa a considerar essa parte como acertada, mesmo antes de quem recebe confirmar.

**Fluxos alternativos:**
- 2a. Nenhuma conta cadastrada no perfil principal: sistema orienta a cadastrar uma primeiro (ver UC01).
- 3a. Valor inválido: sistema exibe alerta.

---

## UC14 — Receber Repasse (Escolher Conta e Data de Destino)
**Ator:** Usuário (quem recebe, segundo UC13)
**Pré-condições:** Existe um repasse com status "pendente" tendo o usuário logado como destinatário.
**Fluxo principal:**
1. Ao abrir o Painel, o usuário vê um cartão "Você recebeu [valor] de [nome]" — a "caixinha" pendente.
2. Usuário escolhe, entre as suas próprias contas, para qual o dinheiro foi (o app não sabe automaticamente, já que o repasse pode ter sido feito por Pix, dinheiro em mãos etc.) e em que data ele caiu.
3. Usuário toca em "Confirmar".
4. Sistema lança de verdade uma **receita** no perfil principal do usuário — categoria "Repasses recebidos" (criada automaticamente na primeira vez), na conta e data escolhidas — e marca o repasse como "recebido".

**Fluxos alternativos:**
- 2a. Nenhuma conta cadastrada no perfil principal: sistema orienta a cadastrar uma primeiro (ver UC01); a caixinha continua pendente até lá.
