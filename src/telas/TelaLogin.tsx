import { useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { entrarUsuario, traduzirErroAuth } from '../services/AutenticacaoService';
import { mostrarAlerta } from '../utils/alerta';

export default function TelaLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    if (!email.trim() || !senha.trim()) {
      mostrarAlerta('Campos obrigatórios', 'Preencha e-mail e senha.');
      return;
    }
    setCarregando(true);
    try {
      await entrarUsuario(email.trim(), senha);
      // Navegação explícita: no Expo Router, apenas estar logado não muda
      // a rota sozinho — é preciso mandar o app para a tela inicial.
      router.replace('/');
    } catch (erro) {
      mostrarAlerta('Não foi possível entrar', traduzirErroAuth(erro));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={estilos.container}>
      <Text style={estilos.titulo}>Finanças App</Text>
      <Text style={estilos.subtitulo}>Entre com sua conta</Text>

      <Text style={estilos.label}>E-mail</Text>
      <TextInput
        style={estilos.input}
        placeholder="seuemail@exemplo.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={estilos.label}>Senha</Text>
      <TextInput
        style={estilos.input}
        placeholder="••••••••"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity style={estilos.botao} onPress={entrar} disabled={carregando}>
        {carregando ? <ActivityIndicator color="#FFF" /> : <Text style={estilos.botaoTexto}>Entrar</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={estilos.link} onPress={() => router.push('/cadastro')}>
        <Text style={estilos.linkTexto}>Não tem conta? Cadastre-se</Text>
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
