import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type CartaoCategoriaProps = {
  nome: string;
  tipo: 'receita' | 'despesa';
  onEditar?: () => void;
  onExcluir?: () => void;
};

export default function CartaoCategoria({ nome, tipo, onEditar, onExcluir }: CartaoCategoriaProps) {
  const cor = tipo === 'receita' ? '#2ECC71' : '#E05C5C';
  return (
    <View style={[estilos.cartao, { borderLeftColor: cor }]}>
      <Text style={estilos.nome}>{nome}</Text>
      {(onEditar || onExcluir) && (
        <View style={estilos.acoes}>
          {onEditar && (
            <TouchableOpacity style={[estilos.botao, estilos.botaoEditar]} onPress={onEditar}>
              <Text style={estilos.botaoTexto}>Editar</Text>
            </TouchableOpacity>
          )}
          {onExcluir && (
            <TouchableOpacity style={[estilos.botao, estilos.botaoExcluir]} onPress={onExcluir}>
              <Text style={estilos.botaoTexto}>Excluir</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    width: '100%', backgroundColor: '#F5F5F5', borderRadius: 8, borderLeftWidth: 4,
    padding: 12, marginVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  nome: { flex: 1, fontSize: 15, color: '#222' },
  acoes: { flexDirection: 'row', gap: 6 },
  botao: { borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10 },
  botaoEditar: { backgroundColor: '#2E7D9E' },
  botaoExcluir: { backgroundColor: '#E05C5C' },
  botaoTexto: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
});
