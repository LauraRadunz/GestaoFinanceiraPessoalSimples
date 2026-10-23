import { StyleSheet, View } from 'react-native';

type BarraProgressoProps = {
  percentual: number;
  cor?: string;
};

export default function BarraProgresso({ percentual, cor }: BarraProgressoProps) {
  const limitado = Math.max(0, Math.min(percentual, 1));
  const corBarra = cor ?? (percentual > 1 ? '#E05C5C' : '#2ECC71');

  return (
    <View style={estilos.trilha}>
      <View style={[estilos.preenchimento, { width: `${limitado * 100}%`, backgroundColor: corBarra }]} />
    </View>
  );
}

const estilos = StyleSheet.create({
  trilha: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  preenchimento: { height: '100%', borderRadius: 4 },
});
