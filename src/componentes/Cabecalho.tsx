import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, usePathname } from 'expo-router';

type CabecalhoProps = {
  titulo: string;
  subtitulo?: string;
};

export default function Cabecalho({ titulo, subtitulo }: CabecalhoProps) {
  const rota = usePathname();
  const mostrarVoltar = rota !== '/' && rota !== '/login' && rota !== '/cadastro';

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  return (
    <View style={estilos.container}>
      {mostrarVoltar && (
        <TouchableOpacity onPress={voltar} style={estilos.botaoVoltar}>
          <Text style={estilos.setaVoltar}>←</Text>
          <Text style={estilos.textoVoltar}>Voltar</Text>
        </TouchableOpacity>
      )}
      <Text style={estilos.titulo}>{titulo}</Text>
      {subtitulo && <Text style={estilos.subtitulo}>{subtitulo}</Text>}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  botaoVoltar: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, alignSelf: 'flex-start' },
  setaVoltar: { fontSize: 20, color: '#2E7D9E', fontWeight: 'bold' },
  textoVoltar: { fontSize: 14, color: '#2E7D9E', fontWeight: '600' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#222' },
  subtitulo: { fontSize: 14, color: '#666', marginTop: 4 },
});