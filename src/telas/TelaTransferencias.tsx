import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Redirect } from 'expo-router';
import Cabecalho from '../componentes/Cabecalho';
import SeletorDropdown from '../componentes/SeletorDropdown';
import { useUsuarioAtual } from '../hooks/useUsuarioAtual';
import { usePerfilAtual } from '../contexto/PerfilContexto';
import { adicionarTransferencia, escutarTransferenciasPorContas, removerTransferencia } from '../services/TransferenciaService';
import { escutarContas } from '../services/ContaService';
import { confirmarAlerta, mostrarAlerta } from '../utils/alerta';
import { dispararEscrita, mensagemDeErroSalvar } from '../utils/limiteDeTempo';
import { formatarMoeda, formatarData } from '../utils/formato';
import { Transferencia } from '../types/Transferencia';
import { Conta } from '../types/Conta';

export default function TelaTransferencias() {
  const { usuario } = useUsuarioAtual();
  const usuarioId = usuario?.uid;
  const { perfilAtivo } = usePerfilAtual();
  const perfilId = perfilAtivo?.id;

  const [contaOrigemId, setContaOrigemId] = useState('');
  const [contaDestinoId, setContaDestinoId] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [descricao, setDescricao] = useState('');
  const [salvo, setSalvo] = useState(false);

  const [transferencias, setTransferencias] = useState<Transferencia[]>([]);
  const [contas, setContas] = useState<Conta[]>([]);

  useEffect(() => {
    if (!perfilId) return;
    const cancelarContas = escutarContas(perfilId, setContas);
    return cancelarContas;
  }, [perfilId]);

  useEffect(() => {
    if (!perfilId) return;
    return escutarTransferenciasPorContas(contas.map((c) => c.id), setTransferencias);
  }, [perfilId, contas]);

  if (!usuarioId) {
    return <Redirect href="/login" />;
  }

  function limparFormulario() {
    setContaOrigemId('');
    setContaDestinoId('');
    setValor('');
    setData(new Date().toISOString().slice(0, 10));
    setDescricao('');
  }

  function salvar() {
    if (contas.length < 2) {
      mostrarAlerta('É necessário ter duas contas', 'Cadastre ao menos duas contas para transferir valores.');
      return;
    }
    if (!contaOrigemId || !contaDestinoId) {
      mostrarAlerta('Campo obrigatório', 'Selecione a conta de origem e a de destino.');
      return;
    }
    if (contaOrigemId === contaDestinoId) {
      mostrarAlerta('Contas iguais', 'A conta de origem deve ser diferente da conta de destino.');
      return;
    }
    const valorNumerico = parseFloat(valor.replace(',', '.'));
    if (!valorNumerico || valorNumerico <= 0) {
      mostrarAlerta('Valor inválido', 'Informe um valor maior que zero.');
      return;
    }

    dispararEscrita(
      adicionarTransferencia({ contaOrigemId, contaDestinoId, valor: valorNumerico, data, descricao }).catch((erro) => {
        console.error(erro);
        mostrarAlerta('Erro ao salvar', mensagemDeErroSalvar());
      })
    );
    limparFormulario();
    setSalvo(true);
    setTimeout(() => setSalvo(false), 1500);
  }

  function excluir(id: string) {
    confirmarAlerta('Excluir transferência', 'Deseja excluir esta transferência?', async () => {
      try {
        await removerTransferencia(id);
      } catch (erro) {
        console.error(erro);
        mostrarAlerta('Erro ao excluir', 'Não foi possível excluir a transferência. Tente novamente.');
      }
    });
  }

  const nomeConta = (id: string) => contas.find((c) => c.id === id)?.nome ?? '—';
  const ordenadas = [...transferencias].sort((a, b) => (a.data < b.data ? 1 : -1));
  const itensConta = contas.map((c) => ({ label: c.nome, value: c.id }));

  return (
    <ScrollView contentContainerStyle={estilos.container}>
      <Cabecalho titulo="Nova transferência" />

      {contas.length === 0 && (
        <Text style={estilos.dica}>Cadastre ao menos duas contas na aba "Contas" antes de transferir.</Text>
      )}

      <Text style={estilos.label}>De</Text>
      <SeletorDropdown valor={contaOrigemId} aoMudar={setContaOrigemId} itens={itensConta} placeholder="Conta de origem..." />

      <Text style={estilos.label}>Para</Text>
      <SeletorDropdown valor={contaDestinoId} aoMudar={setContaDestinoId} itens={itensConta} placeholder="Conta de destino..." />

      <Text style={estilos.label}>Valor (R$) *</Text>
      <TextInput style={estilos.input} placeholder="0,00" keyboardType="numeric" value={valor} onChangeText={setValor} />

      <Text style={estilos.label}>Data</Text>
      <TextInput style={estilos.input} placeholder="AAAA-MM-DD" value={data} onChangeText={setData} />

      <Text style={estilos.label}>Descrição</Text>
      <TextInput style={estilos.input} placeholder="Ex.: Reforço na poupança" value={descricao} onChangeText={setDescricao} />

      <TouchableOpacity style={estilos.botao} onPress={salvar}>
        <Text style={estilos.botaoTexto}>{salvo ? 'Salvo ✓' : 'Salvar transferência'}</Text>
      </TouchableOpacity>

      <Text style={estilos.secaoTitulo}>Transferências realizadas</Text>

      {ordenadas.length === 0 ? (
        <Text style={estilos.vazio}>Nenhuma transferência registrada.</Text>
      ) : (
        ordenadas.map((t) => (
          <View key={t.id} style={estilos.cartao}>
            <View style={estilos.info}>
              <Text style={estilos.descricao}>{nomeConta(t.contaOrigemId)} → {nomeConta(t.contaDestinoId)}</Text>
              <Text style={estilos.meta}>{formatarData(t.data)}{t.descricao ? ` · ${t.descricao}` : ''}</Text>
            </View>
            <Text style={estilos.valor}>{formatarMoeda(t.valor)}</Text>
            <TouchableOpacity style={estilos.botaoExcluir} onPress={() => excluir(t.id)}>
              <Text style={estilos.botaoExcluirTexto}>Excluir</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 40 },
  label: { fontSize: 14, color: '#333', marginTop: 16, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 10, fontSize: 14, color: '#222' },
  dica: { fontSize: 12, color: '#999', fontStyle: 'italic', marginTop: 12 },
  botao: { backgroundColor: '#2E7D9E', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  botaoTexto: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  secaoTitulo: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 32, marginBottom: 8, borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingTop: 16 },
  vazio: { fontSize: 14, color: '#777', fontStyle: 'italic', marginTop: 8 },
  cartao: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 12, marginVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 8 },
  info: { flex: 1 },
  descricao: { fontSize: 14, fontWeight: 'bold', color: '#222' },
  meta: { fontSize: 12, color: '#666', marginTop: 2 },
  valor: { fontSize: 14, fontWeight: 'bold', color: '#222' },
  botaoExcluir: { backgroundColor: '#E05C5C', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10 },
  botaoExcluirTexto: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
});
