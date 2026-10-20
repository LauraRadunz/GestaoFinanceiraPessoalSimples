import { StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';

type Item = { label: string; value: string };

type SeletorDropdownProps = {
  valor: string;
  aoMudar: (valor: string) => void;
  itens: Item[];
  placeholder?: string;
};

<<<<<<< HEAD
=======
/**
 * Dropdown nativo (menu suspenso) reutilizável, usado sempre que o
 * usuário precisa escolher 1 opção entre várias já cadastradas
 * (conta, grupo de categoria etc.) — em vez de uma lista de botões.
 */
>>>>>>> dccad0bf6c13c0cc0f1ea7700258fb83db96d2fc
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
