import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Redirect, router } from 'expo-router';
import Cabecalho from '../componentes/Cabecalho';
import CartaoConta from '../componentes/CartaoConta';
import { useUsuarioAtual } from '../hooks/useUsuarioAtual';
import { usePerfilAtual } from '../contexto/PerfilContexto';
import { adicionarConta, atualizarConta, escutarContas, removerConta } from '../services/ContaService';
import { calcularSaldoConta } from '../utils/calculos';
import { confirmarAlerta, mostrarAlerta } from '../utils/alerta';
import { dispararEscrita, mensagemDeErroSalvar } from '../utils/limiteDeTempo';
import { Conta, TipoConta } from '../types/Conta';

const tiposDeConta: { valor: TipoConta; rotulo: string }[] = [
  { valor: 'corrente', rotulo: 'Conta corrente' },
  { valor: 'poupanca', rotulo: 'Poupança' },
  { valor: 'dinheiro', rotulo: 'Dinheiro' },
  { valor: 'outro', rotulo: 'Outro' },
];

export default function TelaContas() {
  const { usuario } = useUsuarioAtual();
  const usuarioId = usuario?.uid;
  const { perfilAtivo, carregandoPerfis } = usePerfilAtual();
  const perfilId = perfilAtivo?.id;

  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoConta>('corrente');
  const [saldoInicial, setSaldoInicial] = useState('0');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  const [contas, setContas] = useState<Conta[]>([]);

  useEffect(() => {
    if (!perfilId) return;
    return escutarContas(perfilId, setContas);
  }, [perfilId]);

  if (!usuarioId) {
    return <Redirect href="/login" />;
  }

  if (!carregandoPerfis && perfilAtivo && perfilAtivo.tipo !== 'principal') {
    return (
      <View style={estilos.avisoContainer}>
        <Cabecalho titulo="Contas" />
        <Text style={estilos.avisoTexto}>
          O perfil "{perfilAtivo.nome}" não tem contas de dinheiro próprias — só o perfil principal tem. Troque para o
          perfil "Pessoal" para gerenciar contas.
        </Text>
        <TouchableOpacity style={estilos.botaoAviso} onPress={() => router.push('/')}>
          <Text style={estilos.botaoTexto}>Voltar ao início</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function limparFormulario() {
    setNome('');
    setTipo('corrente');
    setSaldoInicial('0');
    setEditandoId(null);
  }

  function salvar() {
    if (!nome.trim()) {
      mostrarAlerta('Campo obrigatório', 'Informe o nome da conta.');
      return;
    }
    const valorInicial = parseFloat(saldoInicial.replace(',', '.')) || 0;

    if (editandoId !== null) {
      dispararEscrita(atualizarConta(editandoId, { nome, tipo, saldoInicial: valorInicial }).catch((erro) => {
        console.error(erro);
        mostrarAlerta('Erro ao salvar', mensagemDeErroSalvar());
      }));
    } else {
      dispararEscrita(adicionarConta({ perfilId: perfilId!, nome, tipo, saldoInicial: valorInicial }).catch((erro) => {
        console.error(erro);
        mostrarAlerta('Erro ao salvar', mensagemDeErroSalvar());
      }));
    }
    limparFormulario();
    setSalvo(true);
    setTimeout(() => setSalvo(false), 1500);
  }

  function editar(conta: Conta) {
    setNome(conta.nome);
    setTipo(conta.tipo);
    setSaldoInicial(String(conta.saldoInicial));
    setEditandoId(conta.id);
  }

  function excluir(id: string, nomeDaConta: string) {
    confirmarAlerta('Excluir conta', `Deseja excluir "${nomeDaConta}"?`, async () => {
      try {
        await removerConta(id);
      } catch (erro) {
        console.error(erro);
        mostrarAlerta('Erro ao excluir', 'Não foi possível excluir a conta. Tente novamente.');
      }
    });
  }

  return (
    <ScrollView contentContainerStyle={estilos.container}>
      <Cabecalho titulo={editandoId !== null ? 'Editar conta' : 'Nova conta'} />

      <Text style={estilos.label}>Nome *</Text>
      <TextInput style={estilos.input} placeholder="Ex.: Poupança 51" value={nome} onChangeText={setNome} />

      <Text style={estilos.label}>Tipo</Text>
      <View style={estilos.opcoes}>
        {tiposDeConta.map((opcao) => (
          <TouchableOpacity
            key={opcao.valor}
            style={[estilos.opcao, tipo === opcao.valor && estilos.opcaoSelecionada]}
            onPress={() => setTipo(opcao.valor)}
          >
            <Text style={[estilos.opcaoTexto, tipo === opcao.valor && estilos.opcaoTextoSelecionado]}>{opcao.rotulo}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={estilos.label}>Saldo inicial</Text>
      <TextInput
        style={estilos.input}
        placeholder="0,00"
        keyboardType="numeric"
        value={saldoInicial}
        onChangeText={setSaldoInicial}
      />

      <TouchableOpacity style={estilos.botao} onPress={salvar}>
        <Text style={estilos.botaoTexto}>
          {salvo ? 'Salvo ✓' : editandoId !== null ? 'Salvar alterações' : 'Salvar conta'}
        </Text>
      </TouchableOpacity>

      {editandoId !== null && (
        <TouchableOpacity style={estilos.botaoCancelar} onPress={limparFormulario}>
          <Text style={estilos.botaoCancelarTexto}>Cancelar edição</Text>
        </TouchableOpacity>
      )}

      <Text style={estilos.secaoTitulo}>Contas cadastradas</Text>

      {contas.length === 0 ? (
        <Text style={estilos.vazio}>Nenhuma conta cadastrada.</Text>
      ) : (
        contas.map((c) => (
          <CartaoConta
            key={c.id}
            nome={c.nome}
            tipo={c.tipo}
            saldo={calcularSaldoConta(c)}
            onEditar={() => editar(c)}
            onExcluir={() => excluir(c.id, c.nome)}
          />
        ))
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 40 },
  avisoContainer: { flex: 1, backgroundColor: '#fff' },
  avisoTexto: { fontSize: 14, color: '#666', marginHorizontal: 20, marginTop: 16, lineHeight: 20 },
  label: { fontSize: 14, color: '#333', marginTop: 16, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 10, fontSize: 14, color: '#222' },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcao: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  opcaoSelecionada: { backgroundColor: '#2E7D9E', borderColor: '#2E7D9E' },
  opcaoTexto: { fontSize: 13, color: '#666' },
  opcaoTextoSelecionado: { color: '#FFF', fontWeight: 'bold' },
  botao: { backgroundColor: '#2E7D9E', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  botaoAviso: { backgroundColor: '#2E7D9E', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16, marginHorizontal: 20 },
  botaoTexto: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  botaoCancelar: { borderWidth: 1, borderColor: '#2E7D9E', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  botaoCancelarTexto: { color: '#2E7D9E', fontSize: 16, fontWeight: 'bold' },
  secaoTitulo: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 32, marginBottom: 8, borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingTop: 16 },
  vazio: { fontSize: 14, color: '#777', fontStyle: 'italic', marginTop: 8 },
});
