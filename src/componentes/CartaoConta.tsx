import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatarMoeda } from '../utils/formato';

const rotulosTipo: Record<string, string> = {
  poupanca: 'Poupança',
  corrente: 'Conta corrente',
  dinheiro: 'Dinheiro em espécie',
  outro: 'Outro',
};

type CartaoContaProps = {
  nome: string;
  tipo: string;
  saldo: number;
  onEditar?: () => void;
  onExcluir?: () => void;
};

export default function CartaoConta({ nome, tipo, saldo, onEditar, onExcluir }: CartaoContaProps) {
  return (
    <View style={estilos.cartao}>
      <View style={estilos.info}>
        <Text style={estilos.nome}>{nome}</Text>
        <Text style={estilos.tipo}>{rotulosTipo[tipo] ?? tipo}</Text>
        <Text style={estilos.saldo}>{formatarMoeda(saldo)}</Text>
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
  cartao: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D9E',
    padding: 12,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  info: { flex: 1 },
  nome: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 2 },
  tipo: { fontSize: 12, color: '#666' },
  saldo: { fontSize: 15, fontWeight: 'bold', color: '#2E7D9E', marginTop: 4 },
  acoes: { flexDirection: 'row', gap: 6 },
  botao: { borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10 },
  botaoEditar: { backgroundColor: '#2E7D9E' },
  botaoExcluir: { backgroundColor: '#E05C5C' },
  botaoTexto: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
});
