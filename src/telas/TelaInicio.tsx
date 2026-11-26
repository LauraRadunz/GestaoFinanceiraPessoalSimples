import { router, Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import Cabecalho from '../componentes/Cabecalho';
import { useUsuarioAtual } from '../hooks/useUsuarioAtual';
import { usePerfilAtual } from '../contexto/PerfilContexto';
import { sairUsuario } from '../services/AutenticacaoService';
import { escutarContas } from '../services/ContaService';
import { escutarCategorias } from '../services/CategoriaService';
import { escutarLancamentosPorCategorias, escutarLancamentosPorContas } from '../services/LancamentoService';
import { escutarTransferenciasPorContas } from '../services/TransferenciaService';
import { escutarConvitesPendentes, aceitarConvite, recusarConvite } from '../services/ConviteService';
import { escutarRepassesPendentesPara, escutarRepassesDoPerfil, receberRepasse } from '../services/RepasseService';
import { calcularSaldoConta, calcularSaldoTotal, calcularResumoMes, calcularDivisaoDeGastos } from '../utils/calculos';
import { confirmarAlerta, mostrarAlerta } from '../utils/alerta';
import { dispararEscrita, mensagemDeErroSalvar } from '../utils/limiteDeTempo';
import { formatarMoeda, hojeISO, mesAtual, nomeDoMes } from '../utils/formato';
import { Conta } from '../types/Conta';
import { Categoria } from '../types/Categoria';
import { Lancamento } from '../types/Lancamento';
import { Transferencia } from '../types/Transferencia';
import { Convite } from '../types/Convite';
import { Repasse } from '../types/Repasse';

export default function TelaInicio() {
  const { usuario } = useUsuarioAtual();
  const usuarioId = usuario?.uid;
  const { perfis, perfilAtivo, carregandoPerfis, definirPerfilAtivo } = usePerfilAtual();
  const perfilId = perfilAtivo?.id;
  const ehPrincipal = perfilAtivo?.tipo === 'principal';
  const [contas, setContas] = useState<Conta[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [lancamentosDoPerfil, setLancamentosDoPerfil] = useState<Lancamento[]>([]);
  const [lancamentosDasContas, setLancamentosDasContas] = useState<Lancamento[]>([]);
  const [transferencias, setTransferencias] = useState<Transferencia[]>([]);
  const [convites, setConvites] = useState<Convite[]>([]);
  const [contasProprias, setContasProprias] = useState<Conta[]>([]);
  const [repassesPendentes, setRepassesPendentes] = useState<Repasse[]>([]);
  const [repassesDoPerfilAtivo, setRepassesDoPerfilAtivo] = useState<Repasse[]>([]);
  const [contaEscolhida, setContaEscolhida] = useState<Record<string, string>>({});
  const [dataEscolhida, setDataEscolhida] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!perfilId) return;
    const cancelarContas = escutarContas(perfilId, setContas);
    const cancelarCategorias = escutarCategorias(perfilId, setCategorias);
    return () => {
      cancelarContas();
      cancelarCategorias();
    };
  }, [perfilId]);

  useEffect(() => {
    if (!perfilId) return;
    return escutarLancamentosPorCategorias(categorias.map((c) => c.id), setLancamentosDoPerfil);
  }, [perfilId, categorias]);

  useEffect(() => {
    if (!perfilId) return;
    return escutarLancamentosPorContas(contas.map((c) => c.id), setLancamentosDasContas);
  }, [perfilId, contas]);

  useEffect(() => {
    if (!perfilId) return;
    return escutarTransferenciasPorContas(contas.map((c) => c.id), setTransferencias);
  }, [perfilId, contas]);

  // Convites pendentes de compartilhamento de perfil, é assim que a
  // pessoa "recebe uma solicitação para aceitar" ao fazer login.
  useEffect(() => {
    if (!usuario?.email) return;
    return escutarConvitesPendentes(usuario.email, setConvites);
  }, [usuario?.email]);

  useEffect(() => {
    if (!usuarioId) return;
    return escutarContas(usuarioId, setContasProprias);
  }, [usuarioId]);

  useEffect(() => {
    if (!usuarioId) return;
    return escutarRepassesPendentesPara(usuarioId, setRepassesPendentes);
  }, [usuarioId]);

  // Repasses do perfil secundário ativo, pra "descontar" o que já foi
  // acertado do resumo de "sua parte" mostrado aqui na Home.
  useEffect(() => {
    if (ehPrincipal || !perfilId) {
      setRepassesDoPerfilAtivo([]);
      return;
    }
    return escutarRepassesDoPerfil(perfilId, setRepassesDoPerfilAtivo);
  }, [ehPrincipal, perfilId]);

  function confirmarRecebimento(repasse: Repasse) {
    const contaId = contaEscolhida[repasse.id];
    if (!contaId) {
      mostrarAlerta('Campo obrigatório', 'Escolha pra qual das suas contas esse valor foi.');
      return;
    }
    const data = dataEscolhida[repasse.id] || hojeISO();
    // depois que salva a caixinha some sozinha
    dispararEscrita(
      receberRepasse(repasse, contaId, data).catch((erro) => {
        console.error(erro);
        mostrarAlerta('Erro ao confirmar', mensagemDeErroSalvar());
      })
    );
  }

  // Enquanto o Firebase ainda não confirmou o usuário, ou se ninguém
  // estiver logado, manda para a tela de login em vez de ficar esperando
  // para sempre.
  
  if (!usuarioId) {
    return <Redirect href="/login" />;
  }

  function sair() {
    confirmarAlerta('Sair', 'Deseja sair da sua conta?', async () => {
      await sairUsuario();
      router.replace('/login');
    });
  }

  function responderConvite(convite: Convite, aceitar: boolean) {
    if (aceitar) {
      dispararEscrita(
        aceitarConvite(convite, usuarioId!, usuario?.displayName || usuario?.email || undefined).catch((erro) => {
          console.error(erro);
          mostrarAlerta('Erro ao aceitar', mensagemDeErroSalvar());
        })
      );
      definirPerfilAtivo(convite.perfilId);
    } else {
      dispararEscrita(
        recusarConvite(convite).catch((erro) => {
          console.error(erro);
          mostrarAlerta('Erro ao recusar', mensagemDeErroSalvar());
        })
      );
    }
  }

  const mes = mesAtual();
  const resumo = calcularResumoMes(lancamentosDoPerfil, mes);
  const total = calcularSaldoTotal(contas, lancamentosDasContas, transferencias);
  const meuSaldoNaDivisao =
    !ehPrincipal && perfilAtivo && perfilAtivo.membros.length > 1
      ? calcularDivisaoDeGastos(lancamentosDoPerfil, perfilAtivo.membros, repassesDoPerfilAtivo).find(
          (s) => s.usuarioId === usuarioId
        )
      : null;

  return (
    <ScrollView contentContainerStyle={estilos.container}>
      <View style={estilos.cabecalhoLinha}>
        <Cabecalho titulo="Finanças App" subtitulo={usuario?.displayName ? `Olá, ${usuario.displayName}` : 'Seu painel financeiro'} />
        <TouchableOpacity style={estilos.botaoSair} onPress={sair}>
          <Text style={estilos.botaoSairTexto}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={estilos.seletorPerfilLinha}>
        <View style={estilos.perfisContainer}>
          {perfis.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[estilos.chipPerfil, perfilAtivo?.id === p.id && estilos.chipPerfilAtivo]}
              onPress={() => definirPerfilAtivo(p.id)}
            >
              <Text style={[estilos.chipPerfilTexto, perfilAtivo?.id === p.id && estilos.chipPerfilTextoAtivo]}>{p.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={() => router.push('/perfis')}>
          <Text style={estilos.linkGerenciar}>Gerenciar perfis</Text>
        </TouchableOpacity>
      </View>

      {convites.length > 0 && (
        <View style={estilos.cartaoConvites}>
          <Text style={estilos.rotulo}>Convites pendentes</Text>
          {convites.map((c) => (
            <View key={c.id} style={estilos.linhaConvite}>
              <Text style={estilos.textoConvite}>
                {c.deUsuarioNome} convidou você para o perfil "{c.perfilNome}"
              </Text>
              <View style={estilos.botoesConvite}>
                <TouchableOpacity style={estilos.botaoAceitar} onPress={() => responderConvite(c, true)}>
                  <Text style={estilos.botaoConviteTexto}>Aceitar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={estilos.botaoRecusar} onPress={() => responderConvite(c, false)}>
                  <Text style={estilos.botaoConviteTexto}>Recusar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {repassesPendentes.length > 0 && (
        <View style={estilos.cartaoCaixinha}>
          <Text style={estilos.rotulo}>Você recebeu</Text>
          {repassesPendentes.map((r) => (
            <View key={r.id} style={estilos.linhaCaixinha}>
              <Text style={estilos.textoCaixinha}>
                {formatarMoeda(r.valor)} de {r.deUsuarioNome}
              </Text>
              <Text style={estilos.dicaCaixinha}>Pra qual das suas contas esse dinheiro foi?</Text>
              {contasProprias.length === 0 ? (
                <Text style={estilos.dicaCaixinha}>Cadastre uma conta em "Contas" pra poder escolher.</Text>
              ) : (
                <View style={estilos.opcoesCaixinha}>
                  {contasProprias.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[estilos.chipConta, contaEscolhida[r.id] === c.id && estilos.chipContaSelecionada]}
                      onPress={() => setContaEscolhida((atual) => ({ ...atual, [r.id]: c.id }))}
                    >
                      <Text style={[estilos.chipContaTexto, contaEscolhida[r.id] === c.id && estilos.chipContaTextoSelecionado]}>
                        {c.nome}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <Text style={estilos.dicaCaixinha}>Data em que caiu na conta</Text>
              <TextInput
                style={estilos.inputCaixinha}
                placeholder="AAAA-MM-DD"
                value={dataEscolhida[r.id] ?? hojeISO()}
                onChangeText={(v) => setDataEscolhida((atual) => ({ ...atual, [r.id]: v }))}
              />
              <TouchableOpacity style={estilos.botaoReceber} onPress={() => confirmarRecebimento(r)}>
                <Text style={estilos.botaoConviteTexto}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {carregandoPerfis || !perfilAtivo ? (
        <Text style={estilos.vazio}>Carregando perfil...</Text>
      ) : (
        <>
          <View style={estilos.navContainer}>
            {ehPrincipal && (
              <TouchableOpacity style={estilos.botao} onPress={() => router.push('/contas')}>
                <Text style={estilos.botaoTexto}>Contas</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={estilos.botao} onPress={() => router.push('/categorias')}>
              <Text style={estilos.botaoTexto}>Categorias</Text>
            </TouchableOpacity>
            <TouchableOpacity style={estilos.botao} onPress={() => router.push('/lancamentos')}>
              <Text style={estilos.botaoTexto}>Lançamentos</Text>
            </TouchableOpacity>
            {ehPrincipal && (
              <TouchableOpacity style={estilos.botao} onPress={() => router.push('/transferencias')}>
                <Text style={estilos.botaoTexto}>Transferências</Text>
              </TouchableOpacity>
            )}
            {ehPrincipal && (
              <TouchableOpacity style={estilos.botao} onPress={() => router.push('/metas')}>
                <Text style={estilos.botaoTexto}>Metas</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={estilos.botao} onPress={() => router.push('/orcamento')}>
              <Text style={estilos.botaoTexto}>Orçamento</Text>
            </TouchableOpacity>
          </View>

          {meuSaldoNaDivisao && (
            <View style={estilos.cartaoResumo}>
              <Text style={estilos.rotulo}>Sua parte em {perfilAtivo?.nome}</Text>
              <Text
                style={[
                  estilos.valorTotal,
                  { fontSize: 20, color: meuSaldoNaDivisao.saldo >= 0 ? '#2ECC71' : '#E05C5C' },
                ]}
              >
                {meuSaldoNaDivisao.saldo >= 0
                  ? `A receber ${formatarMoeda(meuSaldoNaDivisao.saldo)}`
                  : `Você deve ${formatarMoeda(-meuSaldoNaDivisao.saldo)}`}
              </Text>
              <Text style={estilos.rotuloPequeno}>Veja o detalhe em Lançamentos</Text>
            </View>
          )}

          {ehPrincipal && (
            <View style={estilos.cartaoResumo}>
              <Text style={estilos.rotulo}>Saldo total</Text>
              <Text style={estilos.valorTotal}>{formatarMoeda(total)}</Text>
            </View>
          )}

          <View style={estilos.cartaoResumo}>
            <Text style={estilos.rotulo}>Resumo de {nomeDoMes(mes)}</Text>
            <View style={estilos.linhaResumo}>
              <View>
                <Text style={estilos.rotuloPequeno}>Receitas</Text>
                <Text style={[estilos.valorResumo, { color: '#2ECC71' }]}>{formatarMoeda(resumo.receitas)}</Text>
              </View>
              <View>
                <Text style={estilos.rotuloPequeno}>Despesas</Text>
                <Text style={[estilos.valorResumo, { color: '#E05C5C' }]}>{formatarMoeda(resumo.despesas)}</Text>
              </View>
              <View>
                <Text style={estilos.rotuloPequeno}>Lucro do mês</Text>
                <Text style={estilos.valorResumo}>{formatarMoeda(resumo.saldo)}</Text>
              </View>
            </View>
          </View>

          {ehPrincipal && (
            <>
              <Text style={estilos.secaoTitulo}>Saldo por conta</Text>
              {contas.length === 0 ? (
                <Text style={estilos.vazio}>Nenhuma conta cadastrada. Toque em "Contas" para começar.</Text>
              ) : (
                contas.map((conta) => (
                  <View key={conta.id} style={estilos.linhaConta}>
                    <Text style={estilos.nomeConta}>{conta.nome}</Text>
                    <Text style={estilos.saldoConta}>{formatarMoeda(calcularSaldoConta(conta, lancamentosDasContas, transferencias))}</Text>
                  </View>
                ))
              )}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', paddingBottom: 40 },
  cabecalhoLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  botaoSair: { marginRight: 20, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: '#E05C5C' },
  botaoSairTexto: { color: '#E05C5C', fontSize: 12, fontWeight: 'bold' },
  seletorPerfilLinha: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 16, flexWrap: 'wrap', gap: 8 },
  perfisContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, flex: 1 },
  chipPerfil: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14 },
  chipPerfilAtivo: { backgroundColor: '#2E7D9E', borderColor: '#2E7D9E' },
  chipPerfilTexto: { fontSize: 13, color: '#666', fontWeight: '600' },
  chipPerfilTextoAtivo: { color: '#FFF' },
  linkGerenciar: { color: '#2E7D9E', fontSize: 12, fontWeight: '600' },
  cartaoConvites: { backgroundColor: '#FFF6E5', borderRadius: 8, padding: 14, marginHorizontal: 20, marginTop: 16 },
  linhaConvite: { marginTop: 8 },
  textoConvite: { fontSize: 13, color: '#333' },
  botoesConvite: { flexDirection: 'row', gap: 8, marginTop: 6 },
  botaoAceitar: { backgroundColor: '#2ECC71', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 },
  botaoRecusar: { backgroundColor: '#E05C5C', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 },
  botaoConviteTexto: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  navContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginHorizontal: 20, marginTop: 20, marginBottom: 20 },
  botao: { backgroundColor: '#2E7D9E', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16 },
  botaoTexto: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  cartaoResumo: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 16, marginHorizontal: 20, marginBottom: 12 },
  rotulo: { fontSize: 13, color: '#666', marginBottom: 4 },
  rotuloPequeno: { fontSize: 11, color: '#666' },
  valorTotal: { fontSize: 26, fontWeight: 'bold', color: '#222' },
  linhaResumo: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  valorResumo: { fontSize: 15, fontWeight: 'bold', color: '#222' },
  secaoTitulo: { fontSize: 16, fontWeight: 'bold', color: '#333', marginHorizontal: 20, marginTop: 16, marginBottom: 8 },
  vazio: { fontSize: 14, color: '#777', fontStyle: 'italic', marginHorizontal: 20 },
  linhaConta: {
    flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F5F5F5',
    borderRadius: 8, padding: 12, marginHorizontal: 20, marginBottom: 6,
  },
  nomeConta: { fontSize: 14, color: '#222' },
  saldoConta: { fontSize: 14, fontWeight: 'bold', color: '#222' },
  cartaoCaixinha: { backgroundColor: '#E7F5EC', borderRadius: 8, padding: 14, marginHorizontal: 20, marginTop: 16 },
  linhaCaixinha: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#D3EAD9' },
  textoCaixinha: { fontSize: 14, fontWeight: 'bold', color: '#1E7A3B' },
  dicaCaixinha: { fontSize: 12, color: '#4C7A5B', marginTop: 4 },
  opcoesCaixinha: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  chipConta: { borderWidth: 1, borderColor: '#B7DCC2', borderRadius: 20, paddingVertical: 5, paddingHorizontal: 12, backgroundColor: '#FFF' },
  chipContaSelecionada: { backgroundColor: '#2ECC71', borderColor: '#2ECC71' },
  chipContaTexto: { fontSize: 12, color: '#333' },
  chipContaTextoSelecionado: { color: '#FFF', fontWeight: 'bold' },
  inputCaixinha: { borderWidth: 1, borderColor: '#B7DCC2', borderRadius: 6, padding: 8, marginTop: 8, backgroundColor: '#FFF', maxWidth: 160, fontSize: 13 },
  botaoReceber: { backgroundColor: '#2ECC71', borderRadius: 6, paddingVertical: 8, paddingHorizontal: 12, marginTop: 10, alignSelf: 'flex-start' },
});