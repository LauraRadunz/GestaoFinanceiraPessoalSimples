import { router, Redirect } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Cabecalho from '../componentes/Cabecalho';
import { useUsuarioAtual } from '../hooks/useUsuarioAtual';
import { usePerfilAtual } from '../contexto/PerfilContexto';
import { sairUsuario } from '../services/AutenticacaoService';
import { escutarConvitesPendentes, aceitarConvite, recusarConvite } from '../services/ConviteService';
import { escutarContas } from '../services/ContaService';
import { escutarCategorias } from '../services/CategoriaService';
import { escutarLancamentosPorCategorias, escutarLancamentosPorContas } from '../services/LancamentoService';
import { escutarTransferenciasPorContas } from '../services/TransferenciaService';
import { calcularSaldoConta, calcularSaldoTotal, calcularResumoMes } from '../utils/calculos';
import { confirmarAlerta } from '../utils/alerta';
import { formatarMoeda, mesAtual, nomeDoMes } from '../utils/formato';
import { Convite } from '../types/Convite';
import { Conta } from '../types/Conta';
import { Categoria } from '../types/Categoria';
import { Lancamento } from '../types/Lancamento';
import { Transferencia } from '../types/Transferencia';
import { useEffect, useState } from 'react';
import TelaCarregando from './TelaCarregando';

export default function TelaInicio() {
  const { usuario, carregando } = useUsuarioAtual();
  const usuarioId = usuario?.uid;
  const { perfis, perfilAtivo, carregandoPerfis, definirPerfilAtivo } = usePerfilAtual();
  const perfilId = perfilAtivo?.id;
  const ehPrincipal = perfilAtivo?.tipo === 'principal';
  const [convites, setConvites] = useState<Convite[]>([]);
  const [contas, setContas] = useState<Conta[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [lancamentosDasContas, setLancamentosDasContas] = useState<Lancamento[]>([]);
  const [transferencias, setTransferencias] = useState<Transferencia[]>([]);
  const [lancamentosDoPerfil, setLancamentosDoPerfil] = useState<Lancamento[]>([]);

  useEffect(() => {
    if (!usuario?.email) return;
    return escutarConvitesPendentes(usuario.email, setConvites);
  }, [usuario?.email]);

  useEffect(() => {
    if (!perfilId || !ehPrincipal) {
      setContas([]);
      return;
    }
    return escutarContas(perfilId, setContas);
  }, [perfilId, ehPrincipal]);

  useEffect(() => {
    if (!perfilId) return;
    return escutarLancamentosPorContas(contas.map((c) => c.id), setLancamentosDasContas);
  }, [perfilId, contas]);

  useEffect(() => {
    if (!perfilId) return;
    return escutarTransferenciasPorContas(contas.map((c) => c.id), setTransferencias);
  }, [perfilId, contas]);

  useEffect(() => {
    if (!perfilId) return;
    return escutarCategorias(perfilId, setCategorias);
  }, [perfilId]);

  useEffect(() => {
    if (!perfilId) return;
    return escutarLancamentosPorCategorias(categorias.map((c) => c.id), setLancamentosDoPerfil);
  }, [perfilId, categorias]);

  if (carregando) {
    return <TelaCarregando mensagem="Verificando sua conta..." />;
  }
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
      aceitarConvite(convite, usuarioId!, usuario?.displayName || usuario?.email || undefined);
      definirPerfilAtivo(convite.perfilId);
    } else {
      recusarConvite(convite);
    }
  }

  return (
    <ScrollView contentContainerStyle={estilos.container}>
      <View style={estilos.cabecalhoLinha}>
        <Cabecalho titulo="Finanças App" subtitulo={usuario.displayName ? `Olá, ${usuario.displayName}` : 'Seu painel financeiro'} />
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

      {!carregandoPerfis && perfilAtivo && (
        <View style={estilos.navContainer}>
          {ehPrincipal && (
            <TouchableOpacity style={estilos.botaoNav} onPress={() => router.push('/contas')}>
              <Text style={estilos.botaoNavTexto}>Contas</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={estilos.botaoNav} onPress={() => router.push('/categorias')}>
            <Text style={estilos.botaoNavTexto}>Categorias</Text>
          </TouchableOpacity>
          <TouchableOpacity style={estilos.botaoNav} onPress={() => router.push('/lancamentos')}>
            <Text style={estilos.botaoNavTexto}>Lançamentos</Text>
          </TouchableOpacity>
          {ehPrincipal && (
            <TouchableOpacity style={estilos.botaoNav} onPress={() => router.push('/transferencias')}>
              <Text style={estilos.botaoNavTexto}>Transferências</Text>
            </TouchableOpacity>
          )}
          {ehPrincipal && (
            <TouchableOpacity style={estilos.botaoNav} onPress={() => router.push('/metas')}>
              <Text style={estilos.botaoNavTexto}>Metas</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {carregandoPerfis || !perfilAtivo ? (
        <Text style={estilos.dica}>Carregando perfis...</Text>
      ) : (
        <>
          {ehPrincipal && (
            <View style={estilos.cartaoAviso}>
              <Text style={estilos.rotulo}>Saldo total</Text>
              <Text style={estilos.saldoTotal}>{formatarMoeda(calcularSaldoTotal(contas, lancamentosDasContas, transferencias))}</Text>

              {contas.length > 0 && (
                <View style={{ marginTop: 12 }}>
                  {contas.map((c) => (
                    <View key={c.id} style={estilos.linhaConta}>
                      <Text style={estilos.nomeConta}>{c.nome}</Text>
                      <Text style={estilos.saldoConta}>{formatarMoeda(calcularSaldoConta(c, lancamentosDasContas, transferencias))}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={estilos.cartaoAviso}>
            <Text style={estilos.rotulo}>Resumo de {nomeDoMes(mesAtual())}</Text>
            <View style={estilos.linhaResumo}>
              <View>
                <Text style={estilos.rotuloResumo}>Receitas</Text>
                <Text style={[estilos.valorResumo, { color: '#2ECC71' }]}>{formatarMoeda(calcularResumoMes(lancamentosDoPerfil).receitas)}</Text>
              </View>
              <View>
                <Text style={estilos.rotuloResumo}>Despesas</Text>
                <Text style={[estilos.valorResumo, { color: '#E05C5C' }]}>{formatarMoeda(calcularResumoMes(lancamentosDoPerfil).despesas)}</Text>
              </View>
              <View>
                <Text style={estilos.rotuloResumo}>Lucro do mês</Text>
                <Text style={estilos.valorResumo}>{formatarMoeda(calcularResumoMes(lancamentosDoPerfil).saldo)}</Text>
              </View>
            </View>
          </View>
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
  rotulo: { fontSize: 13, color: '#666', marginBottom: 4 },
  cartaoAviso: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 14, marginHorizontal: 20, marginTop: 16 },
  saldoTotal: { fontSize: 24, fontWeight: 'bold', color: '#2E7D9E' },
  linhaConta: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  nomeConta: { fontSize: 14, color: '#222' },
  saldoConta: { fontSize: 14, fontWeight: 'bold', color: '#222' },
  dica: { fontSize: 13, color: '#777', marginHorizontal: 20, marginTop: 16 },
  navContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginHorizontal: 20, marginTop: 16 },
  botaoNav: { backgroundColor: '#2E7D9E', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16 },
  botaoNavTexto: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  linhaResumo: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  rotuloResumo: { fontSize: 12, color: '#666' },
  valorResumo: { fontSize: 16, fontWeight: 'bold', color: '#222', marginTop: 2 },
});
