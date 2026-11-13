import { StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';

type Item = { label: string; value: string };

type SeletorDropdownProps = {
  valor: string;
  aoMudar: (valor: string) => void;
  itens: Item[];
  placeholder?: string;
};

export default function SeletorDropdown({ valor, aoMudar, itens, placeholder = 'Selecione...' }: SeletorDropdownProps) {
  return (
    <View style={estilos.caixa}>
      <Picker selectedValue={valor} onValueChange={(v) => aoMudar(String(v))} style={estilos.picker}>
        <Picker.Item label={placeholder} value="" color="#999" />
        {itens.map((item) => (
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </Picker>
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    color: '#222',
  },
});
