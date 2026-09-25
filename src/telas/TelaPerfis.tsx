import { useState } from 'react';
import { Redirect, router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import Cabecalho from '../componentes/Cabecalho';
import { useUsuarioAtual } from '../hooks/useUsuarioAtual';
import { usePerfilAtual } from '../contexto/PerfilContexto';
import { criarPerfilSecundario, removerPerfil } from '../services/PerfilService';
import { convidarParaPerfil } from '../services/ConviteService';
import { confirmarAlerta, mostrarAlerta } from '../utils/alerta';
import { Perfil } from '../types/Perfil';

export default function TelaPerfis() {
  const { usuario } = useUsuarioAtual();
  const usuarioId = usuario?.uid;
  const { perfis, perfilAtivo, definirPerfilAtivo } = usePerfilAtual();

  const [nomeNovoPerfil, setNomeNovoPerfil] = useState('');
  const [mostrarFormularioNovo, setMostrarFormularioNovo] = useState(false);


  const [perfilConvidando, setPerfilConvidando] = useState<string | null>(null);
  const [emailConvite, setEmailConvite] = useState('');

  if (!usuarioId) {
    return <Redirect href="/login" />;
  }

  function criarPerfil() {
    if (!nomeNovoPerfil.trim()) {
      mostrarAlerta('Campo obrigatório', 'Dê um nome para o novo perfil (ex.: Casa).');
      return;
    }
    const perfil = criarPerfilSecundario(usuarioId!, nomeNovoPerfil, usuario?.displayName || usuario?.email || undefined);
    setNomeNovoPerfil('');
    setMostrarFormularioNovo(false);
    definirPerfilAtivo(perfil.id);
  }

  function enviarConvite(perfil: Perfil) {
    if (!emailConvite.trim()) {
      mostrarAlerta('Campo obrigatório', 'Informe o e-mail da pessoa que você quer convidar.');
      return;
    }
    convidarParaPerfil(
      {
        perfilId: perfil.id,
        perfilNome: perfil.nome,
        deUsuarioId: usuarioId!,
        deUsuarioNome: usuario?.displayName ?? usuario?.email ?? 'Alguém',
        paraEmail: emailConvite,
      },
      () => mostrarAlerta('Erro ao convidar', 'Não foi possível enviar o convite. Tente novamente.')
    );
    mostrarAlerta('Convite enviado', `A pessoa vai ver o convite para "${perfil.nome}" assim que fizer login com esse e-mail (pode levar um instante para chegar).`);
    setEmailConvite('');
    setPerfilConvidando(null);
  }

  function excluirPerfil(perfil: Perfil) {
    confirmarAlerta('Excluir perfil', `Deseja excluir o perfil "${perfil.nome}"? Isso não apaga os dados já lançados nele.`, () => {
      removerPerfil(perfil.id);
    });
  }

  return (
    <ScrollView contentContainerStyle={estilos.container}>
      <Cabecalho titulo="Perfis" subtitulo="Separe as contas da sua casa das suas contas pessoais" />

      {perfis.map((perfil) => {
        const ehDono = perfil.donoId === usuarioId;
        const ehAtivo = perfilAtivo?.id === perfil.id;
        return (
          <View key={perfil.id} style={[estilos.cartao, ehAtivo && estilos.cartaoAtivo]}>
            <View style={estilos.linhaTopo}>
              <View style={{ flex: 1 }}>
                <Text style={estilos.nomePerfil}>{perfil.nome}</Text>
                <Text style={estilos.tipoPerfil}>
                  {perfil.tipo === 'principal' ? 'Perfil principal · tem contas' : 'Perfil compartilhado · sem contas próprias'}
                  {perfil.membros.length > 1 ? ` · ${perfil.membros.length} pessoas` : ''}
                </Text>
              </View>
              {ehAtivo ? (
                <View style={estilos.badgeAtivo}>
                  <Text style={estilos.badgeAtivoTexto}>Em uso</Text>
                </View>
              ) : (
                <TouchableOpacity style={estilos.botaoUsar} onPress={() => { definirPerfilAtivo(perfil.id); router.replace('/'); }}>
                  <Text style={estilos.botaoUsarTexto}>Usar este perfil</Text>
                </TouchableOpacity>
              )}
            </View>

            {perfil.tipo === 'secundario' && ehDono && (
              <View style={estilos.acoesDono}>
                {perfilConvidando === perfil.id ? (
                  <View style={estilos.linhaConvite}>
                    <TextInput
                      style={[estilos.input, { flex: 1 }]}
                      placeholder="e-mail da pessoa"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={emailConvite}
                      onChangeText={setEmailConvite}
                    />
                    <TouchableOpacity style={estilos.botaoEnviar} onPress={() => enviarConvite(perfil)}>
                      <Text style={estilos.botaoEnviarTexto}>Enviar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setPerfilConvidando(null); setEmailConvite(''); }}>
                      <Text style={estilos.cancelarTexto}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={estilos.linhaBotoesSecundarios}>
                    <TouchableOpacity onPress={() => setPerfilConvidando(perfil.id)}>
                      <Text style={estilos.linkAcao}>Convidar por e-mail</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => excluirPerfil(perfil)}>
                      <Text style={estilos.linkAcaoExcluir}>Excluir perfil</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        );
      })}

      {mostrarFormularioNovo ? (
        <View style={estilos.cartao}>
          <Text style={estilos.label}>Nome do novo perfil</Text>
          <TextInput
            style={estilos.input}
            placeholder="Ex.: Casa, Empresa..."
            value={nomeNovoPerfil}
            onChangeText={setNomeNovoPerfil}
          />
          <Text style={estilos.dica}>
            Perfis secundários não têm contas de dinheiro próprias — servem para organizar e dividir categorias, lançamentos
            e orçamento com outras pessoas (ex.: as contas da casa).
          </Text>
          <View style={estilos.linhaBotoes}>
            <TouchableOpacity style={estilos.botao} onPress={criarPerfil}>
              <Text style={estilos.botaoTexto}>Criar perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={estilos.botaoCancelar} onPress={() => { setMostrarFormularioNovo(false); setNomeNovoPerfil(''); }}>
              <Text style={estilos.botaoCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={estilos.botao} onPress={() => setMostrarFormularioNovo(true)}>
          <Text style={estilos.botaoTexto}>+ Criar novo perfil</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 40 },
  cartao: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 14, marginTop: 16 },
  cartaoAtivo: { borderWidth: 1, borderColor: '#2E7D9E' },
  linhaTopo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nomePerfil: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  tipoPerfil: { fontSize: 12, color: '#666', marginTop: 2 },
  badgeAtivo: { backgroundColor: '#2E7D9E', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10 },
  badgeAtivoTexto: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  botaoUsar: { borderWidth: 1, borderColor: '#2E7D9E', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10 },
  botaoUsarTexto: { color: '#2E7D9E', fontSize: 12, fontWeight: 'bold' },
  acoesDono: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingTop: 10 },
  linhaBotoesSecundarios: { flexDirection: 'row', gap: 20 },
  linkAcao: { color: '#2E7D9E', fontSize: 13, fontWeight: '600' },
  linkAcaoExcluir: { color: '#E05C5C', fontSize: 13, fontWeight: '600' },
  linhaConvite: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 10, fontSize: 14, color: '#222', backgroundColor: '#FFF' },
  botaoEnviar: { backgroundColor: '#2E7D9E', borderRadius: 6, paddingVertical: 10, paddingHorizontal: 12 },
  botaoEnviarTexto: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  cancelarTexto: { color: '#999', fontSize: 12 },
  label: { fontSize: 14, color: '#333', marginBottom: 4 },
  dica: { fontSize: 12, color: '#777', fontStyle: 'italic', marginTop: 8 },
  linhaBotoes: { flexDirection: 'row', gap: 8, marginTop: 12 },
  botao: { backgroundColor: '#2E7D9E', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16, flex: 1 },
  botaoTexto: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  botaoCancelar: { borderWidth: 1, borderColor: '#2E7D9E', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16, flex: 1 },
  botaoCancelarTexto: { color: '#2E7D9E', fontSize: 15, fontWeight: 'bold' },
});
