import { router, Redirect } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Cabecalho from '../componentes/Cabecalho';
import { useUsuarioAtual } from '../hooks/useUsuarioAtual';
import { usePerfilAtual } from '../contexto/PerfilContexto';
import { sairUsuario } from '../services/AutenticacaoService';
import { escutarConvitesPendentes, aceitarConvite, recusarConvite } from '../services/ConviteService';
import { escutarContas } from '../services/ContaService';
import { calcularSaldoConta, calcularSaldoTotal } from '../utils/calculos';
import { confirmarAlerta } from '../utils/alerta';
import { formatarMoeda } from '../utils/formato';
import { Convite } from '../types/Convite';
import { Conta } from '../types/Conta';
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
        </View>
      )}

      {carregandoPerfis || !perfilAtivo ? (
        <Text style={estilos.dica}>Carregando perfis...</Text>
      ) : ehPrincipal ? (
        <View style={estilos.cartaoAviso}>
          <Text style={estilos.rotulo}>Saldo total</Text>
          <Text style={estilos.saldoTotal}>{formatarMoeda(calcularSaldoTotal(contas))}</Text>

          {contas.length > 0 && (
            <View style={{ marginTop: 12 }}>
              {contas.map((c) => (
                <View key={c.id} style={estilos.linhaConta}>
                  <Text style={estilos.nomeConta}>{c.nome}</Text>
                  <Text style={estilos.saldoConta}>{formatarMoeda(calcularSaldoConta(c))}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={estilos.cartaoAviso}>
          <Text style={estilos.dica}>
            Perfil ativo: {perfilAtivo.nome}. Categorias e lançamentos entram nas próximas semanas.
          </Text>
        </View>
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
});
