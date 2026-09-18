# Visão do Projeto — Finanças App

## Problema
Controlar finanças pessoais manualmente em planilhas funciona, mas exige preenchimento
manual de fórmulas, não é acessível fora do computador e não escala bem quando o
usuário quer categorizar gastos em detalhe, acompanhar metas ao longo do tempo ou
**dividir gastos com outras pessoas** (casa, república) sem virar uma bagunça de
"quem pagou o quê" no fim do mês.

## Proposta de valor
O **Finanças App** é um aplicativo mobile que permite ao usuário:
- Cadastrar suas contas (poupança, conta corrente, dinheiro em espécie etc.);
- Categorizar receitas e despesas em grupos e subcategorias;
- Lançar movimentações financeiras vinculadas a uma conta e uma categoria;
- Transferir valores entre suas próprias contas;
- Acompanhar o saldo de cada conta e o saldo total, calculados automaticamente;
- Definir metas financeiras e orçamentos por categoria, comparando planejado x realizado;
- **Organizar as finanças em perfis**: um perfil "Pessoal" automático (onde ficam as
  contas de verdade) e perfis secundários compartilháveis (ex.: "Casa"), convidando
  outras pessoas por e-mail;
- **Dividir gastos compartilhados** dentro de um perfil secundário — o app soma as
  despesas, calcula a parte de cada um e mostra exatamente quem deve pagar quanto
  para quem;
- **Acertar essas dívidas dentro do próprio app**: quem deve registra de qual conta
  o dinheiro saiu; quem recebe é avisado e escolhe em qual conta própria aquele
  valor entrou — sem precisar decorar ou anotar em outro lugar quem já pagou.

Tudo isso sem depender de fórmulas manuais: o app calcula os saldos e a divisão
automaticamente a partir dos lançamentos, e mantém os dados salvos na nuvem
(Firebase), acessíveis de qualquer dispositivo.

## Para quem se destina
Qualquer pessoa que queira ter controle simples e visual das próprias finanças —
sozinha ou dividindo despesas com outras pessoas (casa, república, viagem) — sem a
complexidade de apps bancários, a fragilidade de uma planilha manual, ou o
constrangimento de ter que cobrar/anotar manualmente quem deve o quê.

## Diferenciais em relação à planilha original
- Cálculo automático de saldo por conta e saldo geral (sem fórmulas manuais);
- Categorias organizadas em grupos e subcategorias, reutilizáveis mês a mês;
- Metas financeiras com acompanhamento de progresso;
- Orçamento planejado x realizado por categoria, com indicação visual;
- Perfis financeiros separados (pessoal e compartilhados) dentro da mesma conta de
  usuário, cada um com suas próprias categorias e lançamentos;
- Divisão automática de gastos compartilhados, com o cálculo mínimo de "quem paga
  quanto para quem" (em vez de todo mundo pagar todo mundo);
- Acerto de dívidas integrado ao app — sem depender de memória ou de anotação
  externa para saber se alguém já pagou sua parte;
- Dados salvos na nuvem (Firebase Firestore), acessíveis de qualquer lugar, em
  tempo real.
