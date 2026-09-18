# Requisitos do Projeto — Finanças App

Legenda de prioridade: **Alta**, **Média**, **Baixa**

## Requisitos Funcionais (RF)

| ID | Descrição | Prioridade |
|----|-----------|------------|
| RF01 | O sistema deve permitir cadastrar, editar e excluir contas financeiras (nome, tipo, saldo inicial). | Alta |
| RF02 | O sistema deve permitir cadastrar, editar e excluir categorias e subcategorias de receita/despesa. | Alta |
| RF03 | O sistema deve permitir registrar lançamentos financeiros (receita ou despesa), vinculando conta, categoria, valor, data e descrição. | Alta |
| RF04 | O sistema deve permitir editar e excluir lançamentos existentes. | Alta |
| RF05 | O sistema deve calcular automaticamente o saldo de cada conta com base nos lançamentos, transferências e repasses. | Alta |
| RF06 | O sistema deve permitir registrar transferências de valores entre duas contas do mesmo perfil principal. | Alta |
| RF07 | O sistema deve exibir um painel (dashboard) com o saldo total, saldo por conta e resumo do mês. | Alta |
| RF08 | O sistema deve permitir criar e acompanhar metas financeiras (valor alvo, prazo, progresso). | Média |
| RF09 | O sistema deve permitir definir um orçamento planejado por categoria e mês, comparando com o valor realizado. | Média |
| RF10 | O sistema deve permitir filtrar e buscar lançamentos por conta, categoria, tipo e período. | Média |
| RF11 | O sistema deve persistir os dados na nuvem (Firebase Firestore), mantendo-os disponíveis entre sessões e dispositivos. | Alta |
| RF12 | O sistema deve permitir que o usuário crie uma conta (cadastro) e entre com e-mail e senha (login). | Alta |
| RF13 | Cada usuário deve enxergar e gerenciar apenas os dados dos perfis a que pertence, mesmo com múltiplos usuários usando o app. | Alta |
| RF14 | Todo usuário deve nascer automaticamente com um perfil "Pessoal" (tipo principal), onde ficam suas contas de dinheiro reais. | Alta |
| RF15 | O sistema deve permitir criar perfis secundários (ex.: "Casa") para organizar categorias, lançamentos e orçamento compartilhados entre várias pessoas. | Alta |
| RF16 | O sistema deve permitir convidar outra pessoa, por e-mail, para um perfil secundário, e essa pessoa deve poder aceitar ou recusar o convite. | Alta |
| RF17 | O sistema deve permitir trocar entre os perfis do usuário (Pessoal e secundários) a qualquer momento. | Alta |
| RF18 | Num perfil secundário compartilhado, o sistema deve calcular quanto cada membro pagou, qual seria a parte igual de cada um, e a lista mínima de "quem paga quanto para quem" para fechar a conta. | Alta |
| RF19 | O sistema deve permitir que um membro registre que pagou sua parte da divisão a outro membro, informando de qual conta própria o valor saiu, o valor e a data. | Alta |
| RF20 | Ao registrar um pagamento (RF19), o sistema deve lançar automaticamente uma despesa real no perfil principal de quem pagou (descontando a conta de origem), e a dívida correspondente deve deixar de aparecer como pendente na divisão de gastos. | Alta |
| RF21 | O sistema deve avisar quem recebeu um pagamento (RF19) e permitir que essa pessoa escolha em qual conta própria o valor entrou e em que data, lançando automaticamente uma receita real no perfil principal dela antes de somar o valor ao saldo de qualquer conta. | Alta |

## Requisitos Não Funcionais (RNF)

| ID | Descrição | Prioridade |
|----|-----------|------------|
| RNF01 | O aplicativo deve ser desenvolvido em React Native com TypeScript, usando Expo Router para navegação. | Alta |
| RNF02 | O aplicativo deve funcionar em Android e iOS a partir da mesma base de código. | Alta |
| RNF03 | A interface deve seguir um padrão visual consistente (cores, tipografia) em todas as telas. | Média |
| RNF04 | A persistência dos dados deve usar Firebase Firestore, com um serviço dedicado por entidade do domínio. | Alta |
| RNF05 | O código deve ser organizado em camadas (rotas, telas, componentes, serviços, tipos, utilitários) com nomenclatura consistente. | Alta |
| RNF06 | O histórico de commits deve refletir o desenvolvimento incremental do projeto ao longo do semestre. | Alta |
| RNF07 | As telas devem refletir mudanças nos dados em tempo real (sem precisar de ação manual de "atualizar"), usando escuta contínua do Firestore. | Alta |
| RNF08 | A criação do perfil "Pessoal" de um usuário deve ser idempotente (nunca duplicar), mesmo que disparada mais de uma vez (ex.: cadastro e uma verificação automática ao entrar). | Alta |
| RNF09 | Categorias auxiliares criadas automaticamente pelo sistema (ex.: "Repasses enviados"/"Repasses recebidos") devem seguir o mesmo princípio de idempotência do RNF08 — uma só por perfil principal, nunca duplicada. | Alta |
