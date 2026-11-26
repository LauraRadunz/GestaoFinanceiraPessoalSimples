export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// nao da pra usar new Date aqui, ele le como UTC e no Brasil vira o dia anterior
// entao so troca a ordem do texto
export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.slice(0, 10).split('-');
  if (!ano || !mes || !dia) return iso;
  return `${dia}/${mes}/${ano}`;
}

// data de hoje no fuso daqui, o toISOString usava UTC e depois das 21h ja dava o dia seguinte
export function hojeISO(data: Date = new Date()): string {
  const dia = String(data.getDate()).padStart(2, '0');
  return `${mesAtual(data)}-${dia}`;
}

export function mesAtual(data: Date = new Date()): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  return `${ano}-${mes}`;
}

export function nomeDoMes(chave: string): string {
  const [ano, mes] = chave.split('-');
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${meses[parseInt(mes, 10) - 1]}/${ano}`;
}
