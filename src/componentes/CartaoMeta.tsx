import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BarraProgresso from './BarraProgresso';
import { formatarMoeda, formatarData } from '../utils/formato';

type CartaoMetaProps = {
  nome: string;
  valorAlvo: number;
  valorAtual: number;
  prazo?: string;
  onEditar?: () => void;
  onExcluir?: () => void;
};

export default function CartaoMeta({ nome, valorAlvo, valorAtual, prazo, onEditar, onExcluir }: CartaoMetaProps) {
  const percentual = valorAlvo > 0 ? Math.min(valorAtual / valorAlvo, 1) : 0;
  return (
    <View style={estilos.cartao}>
      <Text style={estilos.nome}>{nome}</Text>
      {prazo && <Text style={estilos.meta}>Prazo: {formatarData(prazo)}</Text>}
      <View style={{ marginVertical: 8 }}>
        <BarraProgresso percentual={percentual} />
      </View>
      <View style={estilos.linha}>
        <Text style={estilos.meta}>{formatarMoeda(valorAtual)} de {formatarMoeda(valorAlvo)}</Text>
        <Text style={estilos.percentual}>{Math.round(percentual * 100)}%</Text>
      </View>
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
  nome: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  meta: { fontSize: 12, color: '#666' },
  linha: { flexDirection: 'row', justifyContent: 'space-between' },
  percentual: { fontSize: 12, fontWeight: 'bold', color: '#2ECC71' },
  acoes: { flexDirection: 'row', gap: 6, marginTop: 8 },
  botao: { borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10 },
  botaoEditar: { backgroundColor: '#2E7D9E' },
  botaoExcluir: { backgroundColor: '#E05C5C' },
  botaoTexto: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
});
