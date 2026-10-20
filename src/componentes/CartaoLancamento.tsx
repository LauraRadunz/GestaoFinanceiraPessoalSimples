import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatarMoeda, formatarData } from '../utils/formato';

type CartaoLancamentoProps = {
  descricao: string;
  categoriaNome: string;
  contaNome: string;
  tipo: 'receita' | 'despesa';
  valor: number;
  data: string;
  onEditar?: () => void;
  onExcluir?: () => void;
};

export default function CartaoLancamento({
  descricao, categoriaNome, contaNome, tipo, valor, data, onEditar, onExcluir,
}: CartaoLancamentoProps) {
  const cor = tipo === 'receita' ? '#2ECC71' : '#E05C5C';
  return (
    <View style={estilos.cartao}>
      <View style={estilos.info}>
        <Text style={estilos.descricao}>{descricao || categoriaNome}</Text>
        <Text style={estilos.meta}>{categoriaNome} · {contaNome} · {formatarData(data)}</Text>
      </View>
      <Text style={[estilos.valor, { color: cor }]}>
        {tipo === 'receita' ? '+ ' : '- '}{formatarMoeda(valor)}
      </Text>
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
  cartao: { width: '100%', backgroundColor: '#F5F5F5', borderRadius: 8, padding: 12, marginVertical: 6 },
  info: { marginBottom: 6 },
  descricao: { fontSize: 15, fontWeight: 'bold', color: '#222' },
  meta: { fontSize: 12, color: '#666', marginTop: 2 },
  valor: { fontSize: 15, fontWeight: 'bold', marginBottom: 6 },
  acoes: { flexDirection: 'row', gap: 6 },
  botao: { borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10 },
  botaoEditar: { backgroundColor: '#2E7D9E' },
  botaoExcluir: { backgroundColor: '#E05C5C' },
  botaoTexto: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
});
