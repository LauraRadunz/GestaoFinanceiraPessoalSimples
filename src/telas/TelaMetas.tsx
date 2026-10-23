import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Redirect } from 'expo-router';
import Cabecalho from '../componentes/Cabecalho';
import CartaoMeta from '../componentes/CartaoMeta';
import { useUsuarioAtual } from '../hooks/useUsuarioAtual';
import { usePerfilAtual } from '../contexto/PerfilContexto';
import { adicionarMeta, atualizarMeta, escutarMetas, removerMeta } from '../services/MetaService';
import { escutarContas } from '../services/ContaService';
import { escutarLancamentosPorContas } from '../services/LancamentoService';
import { escutarTransferenciasPorContas } from '../services/TransferenciaService';
import { calcularSaldoConta } from '../utils/calculos';
import { confirmarAlerta, mostrarAlerta } from '../utils/alerta';
import { dispararEscrita, mensagemDeErroSalvar } from '../utils/limiteDeTempo';
import { Meta } from '../types/Meta';
import { Conta } from '../types/Conta';
import { Lancamento } from '../types/Lancamento';
import { Transferencia } from '../types/Transferencia';

export default function TelaMetas() {
  const { usuario } = useUsuarioAtual();
  const usuarioId = usuario?.uid;
  const { perfilAtivo } = usePerfilAtual();
  const perfilId = perfilAtivo?.id;

  const [nome, setNome] = useState('');
  const [valorAlvo, setValorAlvo] = useState('');
  const [prazo, setPrazo] = useState('');
  const [contaId, setContaId] = useState<string | undefined>(undefined);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  const [metas, setMetas] = useState<Meta[]>([]);
  const [contas, setContas] = useState<Conta[]>([]);
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [transferencias, setTransferencias] = useState<Transferencia[]>([]);

  useEffect(() => {
    if (!perfilId) return;
    const cancelarMetas = escutarMetas(perfilId, setMetas);
    const cancelarContas = escutarContas(perfilId, setContas);
    return () => {
      cancelarMetas();
      cancelarContas();
    };
  }, [perfilId]);

  useEffect(() => {
    if (!perfilId) return;
    return escutarLancamentosPorContas(contas.map((c) => c.id), setLancamentos);
  }, [perfilId, contas]);

  useEffect(() => {
    if (!perfilId) return;
    return escutarTransferenciasPorContas(contas.map((c) => c.id), setTransferencias);
  }, [perfilId, contas]);

  if (!usuarioId) {
    return <Redirect href="/login" />;
  }

  function limparFormulario() {
    setNome('');
    setValorAlvo('');
    setPrazo('');
    setContaId(undefined);
    setEditandoId(null);
  }

  function salvar() {
    if (!nome.trim()) {
      mostrarAlerta('Campo obrigatório', 'Dê um nome para a meta.');
      return;
    }
    const valorNumerico = parseFloat(valorAlvo.replace(',', '.'));
    if (!valorNumerico || valorNumerico <= 0) {
      mostrarAlerta('Valor inválido', 'Informe um valor alvo maior que zero.');
      return;
    }

    const dados = { nome, valorAlvo: valorNumerico, prazo: prazo || undefined, contaId };

    if (editandoId !== null) {
      dispararEscrita(atualizarMeta(editandoId, dados).catch((erro) => {
        console.error(erro);
        mostrarAlerta('Erro ao salvar', mensagemDeErroSalvar());
      }));
    } else {
      dispararEscrita(adicionarMeta({ perfilId: perfilId!, ...dados }).catch((erro) => {
        console.error(erro);
        mostrarAlerta('Erro ao salvar', mensagemDeErroSalvar());
      }));
    }
    limparFormulario();
    setSalvo(true);
    setTimeout(() => setSalvo(false), 1500);
  }

  function editar(meta: Meta) {
    setNome(meta.nome);
    setValorAlvo(String(meta.valorAlvo));
    setPrazo(meta.prazo?.slice(0, 10) ?? '');
    setContaId(meta.contaId);
    setEditandoId(meta.id);
  }

  function excluir(id: string, nomeDaMeta: string) {
    confirmarAlerta('Excluir meta', `Deseja excluir "${nomeDaMeta}"?`, async () => {
      try {
        await removerMeta(id);
      } catch (erro) {
        console.error(erro);
        mostrarAlerta('Erro ao excluir', 'Não foi possível excluir a meta. Tente novamente.');
      }
    });
  }

  function valorAtualDaMeta(meta: Meta): number {
    if (!meta.contaId) return 0;
    const conta = contas.find((c) => c.id === meta.contaId);
    if (!conta) return 0;
    return calcularSaldoConta(conta, lancamentos, transferencias);
  }

  return (
    <ScrollView contentContainerStyle={estilos.container}>
      <Cabecalho titulo={editandoId !== null ? 'Editar meta' : 'Nova meta'} />

      <Text style={estilos.label}>Nome da meta *</Text>
      <TextInput style={estilos.input} placeholder="Ex.: Viagem de férias" value={nome} onChangeText={setNome} />

      <Text style={estilos.label}>Valor alvo (R$) *</Text>
      <TextInput style={estilos.input} placeholder="0,00" keyboardType="numeric" value={valorAlvo} onChangeText={setValorAlvo} />

      <Text style={estilos.label}>Prazo</Text>
      <TextInput style={estilos.input} placeholder="AAAA-MM-DD" value={prazo} onChangeText={setPrazo} />

      <Text style={estilos.label}>Conta vinculada (opcional — acompanha o progresso automaticamente)</Text>
      <View style={estilos.opcoes}>
        <TouchableOpacity style={[estilos.opcao, !contaId && estilos.opcaoSelecionada]} onPress={() => setContaId(undefined)}>
          <Text style={[estilos.opcaoTexto, !contaId && estilos.opcaoTextoSelecionado]}>Nenhuma</Text>
        </TouchableOpacity>
        {contas.map((c) => (
          <TouchableOpacity key={c.id} style={[estilos.opcao, contaId === c.id && estilos.opcaoSelecionada]} onPress={() => setContaId(c.id)}>
            <Text style={[estilos.opcaoTexto, contaId === c.id && estilos.opcaoTextoSelecionado]}>{c.nome}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={estilos.botao} onPress={salvar}>
        <Text style={estilos.botaoTexto}>
          {salvo ? 'Salvo ✓' : editandoId !== null ? 'Salvar alterações' : 'Salvar meta'}
        </Text>
      </TouchableOpacity>

      {editandoId !== null && (
        <TouchableOpacity style={estilos.botaoCancelar} onPress={limparFormulario}>
          <Text style={estilos.botaoCancelarTexto}>Cancelar edição</Text>
        </TouchableOpacity>
      )}

      <Text style={estilos.secaoTitulo}>Metas cadastradas</Text>

      {metas.length === 0 ? (
        <Text style={estilos.vazio}>Nenhuma meta cadastrada.</Text>
      ) : (
        metas.map((m) => (
          <CartaoMeta
            key={m.id}
            nome={m.nome}
            valorAlvo={m.valorAlvo}
            valorAtual={valorAtualDaMeta(m)}
            prazo={m.prazo}
            onEditar={() => editar(m)}
            onExcluir={() => excluir(m.id, m.nome)}
          />
        ))
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 40 },
  label: { fontSize: 14, color: '#333', marginTop: 16, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 10, fontSize: 14, color: '#222' },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcao: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  opcaoSelecionada: { backgroundColor: '#2E7D9E', borderColor: '#2E7D9E' },
  opcaoTexto: { fontSize: 13, color: '#666' },
  opcaoTextoSelecionado: { color: '#FFF', fontWeight: 'bold' },
  botao: { backgroundColor: '#2E7D9E', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  botaoTexto: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  botaoCancelar: { borderWidth: 1, borderColor: '#2E7D9E', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  botaoCancelarTexto: { color: '#2E7D9E', fontSize: 16, fontWeight: 'bold' },
  secaoTitulo: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 32, marginBottom: 8, borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingTop: 16 },
  vazio: { fontSize: 14, color: '#777', fontStyle: 'italic', marginTop: 8 },
});
