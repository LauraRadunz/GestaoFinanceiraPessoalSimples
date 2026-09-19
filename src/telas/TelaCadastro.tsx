import { useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { cadastrarUsuario, traduzirErroAuth } from '../services/AutenticacaoService';
import { mostrarAlerta } from '../utils/alerta';

export default function TelaCadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function cadastrar() {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      mostrarAlerta('Campos obrigatórios', 'Preencha nome, e-mail e senha.');
      return;
    }
    if (senha.length < 6) {
      mostrarAlerta('Senha muito curta', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== confirmarSenha) {
      mostrarAlerta('Senhas diferentes', 'A confirmação de senha não confere.');
      return;
    }
    setCarregando(true);
    try {
      await cadastrarUsuario(nome.trim(), email.trim(), senha);
      router.replace('/');

    } catch (erro) {
      mostrarAlerta('Não foi possível cadastrar', traduzirErroAuth(erro));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={estilos.container}>
      <Text style={estilos.titulo}>Criar conta</Text>
      <Text style={estilos.subtitulo}>Leva menos de um minuto</Text>

      <Text style={estilos.label}>Nome</Text>
      <TextInput style={estilos.input} placeholder="Seu nome" value={nome} onChangeText={setNome} />

      <Text style={estilos.label}>E-mail</Text>
      <TextInput
        style={estilos.input}
        placeholder="seuemail@exemplo.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={estilos.label}>Senha (mín. 6 caracteres)</Text>
      <TextInput style={estilos.input} placeholder="••••••••" secureTextEntry value={senha} onChangeText={setSenha} />

      <Text style={estilos.label}>Confirmar senha</Text>
      <TextInput style={estilos.input} placeholder="••••••••" secureTextEntry value={confirmarSenha} onChangeText={setConfirmarSenha} />

      <TouchableOpacity style={estilos.botao} onPress={cadastrar} disabled={carregando}>
        {carregando ? <ActivityIndicator color="#FFF" /> : <Text style={estilos.botaoTexto}>Criar conta</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={estilos.link} onPress={() => router.push('/login')}>
        <Text style={estilos.linkTexto}>Já tem conta? Entrar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#222', textAlign: 'center' },
  subtitulo: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 },
  label: { fontSize: 14, color: '#333', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, fontSize: 14, color: '#222' },
  botao: { backgroundColor: '#2E7D9E', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 20 },
  botaoTexto: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  link: { marginTop: 16, alignItems: 'center' },
  linkTexto: { color: '#2E7D9E', fontSize: 14, fontWeight: '600' },
});
