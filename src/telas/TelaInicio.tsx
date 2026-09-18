import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useUsuarioAtual } from '../hooks/useUsuarioAtual';
import { sairUsuario } from '../services/AutenticacaoService';
import Cabecalho from '../componentes/Cabecalho';
import TelaCarregando from './TelaCarregando';

export default function TelaInicio() {
  const { usuario, carregando } = useUsuarioAtual();

  if (carregando) {
    return <TelaCarregando mensagem="Verificando sua conta..." />;
  }

  if (!usuario) {
    return <Redirect href="/login" />;
  }

  async function sair() {
    await sairUsuario();
    router.replace('/login');
  }

  return (
    <View style={estilos.container}>
      <Cabecalho titulo="Finanças App" subtitulo={`Olá, ${usuario.displayName || usuario.email}`} />
      <View style={estilos.corpo}>
        <Text style={estilos.texto}>Login funcionando! Contas, categorias e o resto do app entram nas próximas semanas.</Text>
        <TouchableOpacity style={estilos.botaoSair} onPress={sair}>
          <Text style={estilos.botaoSairTexto}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  corpo: { padding: 20 },
  texto: { fontSize: 14, color: '#666', marginBottom: 20 },
  botaoSair: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#E05C5C', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 },
  botaoSairTexto: { color: '#E05C5C', fontWeight: 'bold' },
});
