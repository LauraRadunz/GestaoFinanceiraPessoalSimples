import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Redirect } from 'expo-router';
import Cabecalho from '../componentes/Cabecalho';
import SeletorDropdown from '../componentes/SeletorDropdown';
import { useUsuarioAtual } from '../hooks/useUsuarioAtual';
import { usePerfilAtual } from '../contexto/PerfilContexto';
import { adicionarOrcamento, escutarOrcamentosPorCategorias, removerOrcamento } from '../services/OrcamentoService';
import { escutarCategorias } from '../services/CategoriaService';
import { escutarLancamentosPorCategorias } from '../services/LancamentoService';
import { calcularComparativoOrcamento } from '../utils/calculos';
import { confirmarAlerta, mostrarAlerta } from '../utils/alerta';
import { dispararEscrita, mensagemDeErroSalvar } from '../utils/limiteDeTempo';
import { formatarMoeda, mesAtual, nomeDoMes } from '../utils/formato';
import { Orcamento } from '../types/Orcamento';
import { Categoria } from '../types/Categoria';
import { Lancamento } from '../types/Lancamento';

export default function TelaOrcamento() {
  const { usuario } = useUsuarioAtual();
  const usuarioId = usuario?.uid;
  const { perfilAtivo } = usePerfilAtual();
  const perfilId = perfilAtivo?.id;

  const [grupoSelecionado, setGrupoSelecionado] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [valorPlanejado, setValorPlanejado] = useState('');
  const [salvo, setSalvo] = useState(false);

  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);

  const mes = mesAtual();

  useEffect(() => {
    if (!perfilId) return;
    return escutarCategorias(perfilId, setCategorias);
  }, [perfilId]);

  useEffect(() => {
    if (!perfilId) return;
    const categoriaIds = categorias.map((c) => c.id);
    const cancelarOrcamentos = escutarOrcamentosPorCategorias(categoriaIds, setOrcamentos);
    const cancelarLancamentos = escutarLancamentosPorCategorias(categoriaIds, setLancamentos);
    return () => {
      cancelarOrcamentos();
      cancelarLancamentos();
    };
  }, [perfilId, categorias]);

  function salvar() {
    if (!categoriaId) {
      mostrarAlerta('Campo obrigatório', 'Selecione um grupo e uma categoria.');
      return;
    }
    const valorNumerico = parseFloat(valorPlanejado.replace(',', '.'));
    if (!valorNumerico || valorNumerico <= 0) {
      mostrarAlerta('Valor inválido', 'Informe um valor estimado maior que zero.');
      return;
    }

    // Ver TelaContas.tsx: não esperamos a escrita terminar pra liberar o
    // formulário, só disparamos e tratamos erro real em segundo plano.
    dispararEscrita(
      adicionarOrcamento({ categoriaId, mes, valorPlanejado: valorNumerico }).catch((erro) => {
        console.error(erro);
        mostrarAlerta('Erro ao salvar', mensagemDeErroSalvar());
      })
    );
    setGrupoSelecionado('');
    setCategoriaId('');
    setValorPlanejado('');
    setSalvo(true);
    setTimeout(() => setSalvo(false), 1500);
  }

  function excluir(id: string) {
    confirmarAlerta('Excluir orçamento', 'Deseja excluir esta estimativa?', async () => {
      try {
        await removerOrcamento(id);
      } catch (erro) {
        console.error(erro);
        mostrarAlerta('Erro ao excluir', 'Não foi possível excluir. Tente novamente.');
      }
    });
  }

  const categoriasDeDespesa = categorias.filter((c) => c.tipo === 'despesa');
  const gruposDisponiveis = useMemo(
    () => Array.from(new Set(categoriasDeDespesa.map((c) => c.grupo))).sort(),
    [categorias]
  );

  if (!usuarioId) {
    return <Redirect href="/login" />;
  }

  const categoriasFiltradas = categoriasDeDespesa.filter((c) => c.grupo === grupoSelecionado);
  const nomeCategoria = (id: string) => categorias.find((c) => c.id === id)?.nome ?? '—';
  const orcamentosDoMes = orcamentos.filter((o) => o.mes === mes);
  const totalPlanejado = orcamentosDoMes.reduce((soma, o) => soma + o.valorPlanejado, 0);
  const totalRealizado = orcamentosDoMes.reduce(
    (soma, o) => soma + calcularComparativoOrcamento(o, lancamentos).realizado,
    0
  );

  return (
    <ScrollView contentContainerStyle={estilos.container}>
      <Cabecalho
        titulo="Orçamento"
        subtitulo={`${nomeDoMes(mes)} · quanto você estima gastar em cada categoria`}
      />

      <Text style={estilos.label}>Grupo</Text>
      {gruposDisponiveis.length === 0 ? (
        <Text style={estilos.dica}>Cadastre categorias de despesa primeiro.</Text>
      ) : (
        <SeletorDropdown
          valor={grupoSelecionado}
          aoMudar={(g) => { setGrupoSelecionado(g); setCategoriaId(''); }}
          itens={gruposDisponiveis.map((g) => ({ label: g, value: g }))}
          placeholder="Selecione o grupo..."
        />
      )}

      {grupoSelecionado !== '' && (
        <>
          <Text style={estilos.label}>Categoria</Text>
          <View style={estilos.opcoes}>
            {categoriasFiltradas.map((c) => (
              <TouchableOpacity key={c.id} style={[estilos.opcao, categoriaId === c.id && estilos.opcaoSelecionada]} onPress={() => setCategoriaId(c.id)}>
                <Text style={[estilos.opcaoTexto, categoriaId === c.id && estilos.opcaoTextoSelecionado]}>{c.nome}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Text style={estilos.label}>Quanto você estima gastar (R$) *</Text>
      <TextInput style={estilos.input} placeholder="0,00" keyboardType="numeric" value={valorPlanejado} onChangeText={setValorPlanejado} />

      <TouchableOpacity style={estilos.botao} onPress={salvar}>
        <Text style={estilos.botaoTexto}>{salvo ? 'Salvo ✓' : 'Salvar estimativa'}</Text>
      </TouchableOpacity>

      {orcamentosDoMes.length > 0 && (
        <View style={estilos.cartaoTotais}>
          <Text style={estilos.rotulo}>Total do mês</Text>
          <View style={estilos.linhaTotais}>
            <View>
              <Text style={estilos.rotuloPequeno}>Estimado</Text>
              <Text style={estilos.valorTotais}>{formatarMoeda(totalPlanejado)}</Text>
            </View>
            <View>
              <Text style={estilos.rotuloPequeno}>Gasto até agora</Text>
              <Text style={estilos.valorTotais}>{formatarMoeda(totalRealizado)}</Text>
            </View>
          </View>
          <Text style={estilos.dica}>
            É quanto você precisa ter disponível pra cobrir as contas do mês — não é uma meta, então não tem problema
            gastar menos do que estimou.
          </Text>
        </View>
      )}

      <Text style={estilos.secaoTitulo}>Estimativas de {nomeDoMes(mes)}</Text>

      {orcamentosDoMes.length === 0 ? (
        <Text style={estilos.vazio}>Nenhuma estimativa definida para este mês.</Text>
      ) : (
        orcamentosDoMes.map((o) => {
          const { planejado, realizado, diferenca } = calcularComparativoOrcamento(o, lancamentos);
          return (
            <View key={o.id} style={estilos.cartao}>
              <View style={estilos.linhaTopo}>
                <Text style={estilos.nome}>{nomeCategoria(o.categoriaId)}</Text>
                <TouchableOpacity onPress={() => excluir(o.id)}>
                  <Text style={estilos.remover}>remover</Text>
                </TouchableOpacity>
              </View>
              <View style={estilos.linhaComparativo}>
                <Text style={estilos.detalheComparativo}>Estimado: {formatarMoeda(planejado)}</Text>
                <Text style={estilos.detalheComparativo}>Gasto: {formatarMoeda(realizado)}</Text>
              </View>
              <Text style={[estilos.diferenca, { color: diferenca >= 0 ? '#666' : '#E05C5C' }]}>
                {diferenca >= 0
                  ? `Sobram ${formatarMoeda(diferenca)} da estimativa`
                  : `Passou ${formatarMoeda(-diferenca)} da estimativa`}
              </Text>
            </View>
          );
        })
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
  dica: { fontSize: 12, color: '#999', fontStyle: 'italic', marginTop: 6 },
  botao: { backgroundColor: '#2E7D9E', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  botaoTexto: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  cartaoTotais: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 14, marginTop: 20 },
  linhaTotais: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, marginBottom: 8 },
  valorTotais: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  secaoTitulo: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 32, marginBottom: 8, borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingTop: 16 },
  vazio: { fontSize: 14, color: '#777', fontStyle: 'italic', marginTop: 8 },
  cartao: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 12, marginVertical: 6 },
  linhaTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nome: { fontSize: 15, fontWeight: 'bold', color: '#222' },
  remover: { color: '#E05C5C', fontSize: 12 },
  linhaComparativo: { flexDirection: 'row', gap: 16, marginTop: 6 },
  detalheComparativo: { fontSize: 12, color: '#666' },
  diferenca: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  rotulo: { fontSize: 13, color: '#666', marginBottom: 2 },
  rotuloPequeno: { fontSize: 11, color: '#666' },
});
