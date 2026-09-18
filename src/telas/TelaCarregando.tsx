import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

type TelaCarregandoProps = {
  mensagem?: string;
};

export default function TelaCarregando({ mensagem }: TelaCarregandoProps) {
  return (
    <View style={estilos.container}>
      <ActivityIndicator size="large" color="#2E7D9E" />
      {mensagem && <Text style={estilos.mensagem}>{mensagem}</Text>}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 24 },
  mensagem: { marginTop: 16, fontSize: 13, color: '#999', textAlign: 'center' },
});
