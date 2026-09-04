# Requisitos do Projeto — Finanças App

Legenda de prioridade: **Alta**, **Média**, **Baixa**

## Requisitos Funcionais (RF)

| ID | Descrição | Prioridade |
|----|-----------|------------|
| RF01 | O sistema deve permitir cadastrar, editar e excluir contas financeiras no Perfil Principal (nome, tipo, saldo inicial). | Alta |
| RF02 | O sistema deve permitir cadastrar, editar e excluir categorias e subcategorias de receita/despesa por perfil. | Alta |
| RF03 | O sistema deve permitir registrar lançamentos financeiros, vinculando perfil, categoria, valor, data e descrição. No Perfil Principal, o lançamento pode ser vinculado a uma conta; em Perfil Secundário, uma despesa pode ser vinculada a um pagador. | Alta |
| RF04 | O sistema deve permitir editar e excluir lançamentos existentes, respeitando as permissões do perfil. | Alta |
| RF05 | O sistema deve calcular automaticamente o saldo de cada conta do Perfil Principal com base nos lançamentos e transferências. | Alta |
| RF06 | O sistema deve permitir registrar transferências de valores entre duas contas do Perfil Principal. | Alta |
| RF07 | O sistema deve exibir um painel com informações diferentes conforme o perfil ativo: saldo/contas no Perfil Principal e resumo de despesas, receitas e pagamentos por membro em Perfis Secundários. | Alta |
| RF08 | O sistema deve permitir criar e acompanhar metas financeiras por perfil. No Perfil Principal, uma meta pode ser vinculada a uma conta; em Perfil Secundário, não possui conta bancária vinculada. | Média |
| RF09 | O sistema deve permitir definir um orçamento planejado por categoria e mês, comparando com o valor realizado do perfil. | Média |
| RF10 | O sistema deve permitir filtrar e buscar lançamentos por categoria, tipo, período e, quando aplicável, conta ou pagador. | Média |
| RF11 | O sistema deve persistir os dados na nuvem (Firebase Firestore), mantendo-os disponíveis entre sessões e dispositivos. | Alta |
| RF12 | O sistema deve permitir que o usuário crie uma conta e entre com e-mail e senha (login). | Alta |
| RF13 | O sistema deve criar automaticamente um Perfil Principal para cada novo usuário. | Alta |
| RF14 | O sistema deve permitir ao usuário criar, editar e excluir Perfis Secundários de sua autoria, sem permitir a exclusão do Perfil Principal. | Alta |
| RF15 | O sistema deve permitir alternar entre o Perfil Principal e os Perfis Secundários aos quais o usuário possui acesso. | Alta |
| RF16 | O sistema deve permitir ao dono de um Perfil Secundário convidar outro usuário por e-mail. | Alta |
| RF17 | O sistema deve criar convites com status pendente e mostrar a solicitação ao destinatário quando ele fizer login. | Alta |
| RF18 | O sistema deve permitir que o destinatário aceite ou recuse um convite. | Alta |
| RF19 | Após aceitar um convite, o usuário deve ser adicionado como membro do Perfil Secundário e passar a acessar seus dados autorizados. | Alta |
| RF20 | O sistema deve permitir ao dono visualizar, adicionar e remover membros de um Perfil Secundário. | Alta |
| RF21 | O sistema não deve permitir contas financeiras ou transferências dentro de Perfis Secundários. | Alta |
| RF22 | O sistema deve permitir registrar pagamentos feitos por diferentes membros para a mesma despesa compartilhada, possibilitando visualizar quanto cada membro pagou. | Alta |
| RF23 | O sistema deve atualizar em tempo real os dados compartilhados de um Perfil Secundário para os membros autorizados. | Alta |
| RF24 | Cada usuário deve enxergar e gerenciar apenas os dados dos Perfis Principais de sua autoria e dos Perfis Secundários dos quais seja membro autorizado. | Alta |

## Requisitos Não Funcionais (RNF)

| ID | Descrição | Prioridade |
|----|-----------|------------|
| RNF01 | O aplicativo deve ser desenvolvido em React Native com TypeScript, usando Expo Router para navegação. | Alta |
| RNF02 | O aplicativo deve funcionar em Android e iOS a partir da mesma base de código. | Alta |
| RNF03 | A interface deve seguir um padrão visual consistente (cores, tipografia) em todas as telas. | Média |
| RNF04 | A persistência dos dados deve usar Firebase Firestore, com um serviço dedicado por entidade do domínio. | Alta |
| RNF05 | O código deve ser organizado em camadas (rotas, telas, componentes, serviços, tipos) com nomenclatura consistente. | Alta |
| RNF06 | O histórico de commits deve refletir o desenvolvimento incremental do projeto ao longo do semestre. | Alta |
| RNF07 | As telas devem refletir mudanças nos dados em tempo real, sem precisar de ação manual de atualizar, usando escuta contínua do Firestore. | Alta |
| RNF08 | As regras de segurança do Firestore devem impedir acesso de usuários que não sejam membros autorizados de um Perfil Secundário. | Alta |
| RNF09 | O sistema deve manter separados os dados financeiros do Perfil Principal e dos Perfis Secundários, evitando que despesas compartilhadas sejam confundidas com saldos das contas pessoais. | Alta |
