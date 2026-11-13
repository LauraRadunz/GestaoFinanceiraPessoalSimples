import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Redirect } from 'expo-router';
import Cabecalho from '../componentes/Cabecalho';
import CartaoLancamento from '../componentes/CartaoLancamento';
import SeletorDropdown from '../componentes/SeletorDropdown';
import { useUsuarioAtual } from '../hooks/useUsuarioAtual';
import { usePerfilAtual } from '../contexto/PerfilContexto';
import { adicionarLancamento, atualizarLancamento, escutarLancamentosPorCategorias, removerLancamento } from '../services/LancamentoService';
import { escutarContas } from '../services/ContaService';
import { escutarCategorias } from '../services/CategoriaService';
import { escutarRepassesDoPerfil, enviarRepasse } from '../services/RepasseService';
import { confirmarAlerta, mostrarAlerta } from '../utils/alerta';
import { dispararEscrita, mensagemDeErroSalvar } from '../utils/limiteDeTempo';
import { calcularDivisaoDeGastos, calcularAcertos, Acerto } from '../utils/calculos';
import { formatarMoeda } from '../utils/formato';
import { Lancamento } from '../types/Lancamento';
import { Conta } from '../types/Conta';
import { Categoria, TipoCategoria } from '../types/Categoria';
import { Repasse } from '../types/Repasse';

export default function TelaLancamentos() {
  const { usuario } = useUsuarioAtual();
  const usuarioId = usuario?.uid;
  const { perfis, perfilAtivo } = usePerfilAtual();
  const perfilId = perfilAtivo?.id;
  const ehSecundario = perfilAtivo?.tipo === 'secundario';

  const meuPerfilPrincipal = useMemo(() => perfis.find((p) => p.tipo === 'principal'), [perfis]);

  const [tipo, setTipo] = useState<TipoCategoria>('despesa');
  const [contaId, setContaId] = useState('');
  const [grupoSelecionado, setGrupoSelecionado] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [descricao, setDescricao] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [contas, setContas] = useState<Conta[]>([]);
  const [minhasContas, setMinhasContas] = useState<Conta[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [repasses, setRepasses] = useState<Repasse[]>([]);

  const [acertoAbertoIndex, setAcertoAbertoIndex] = useState<number | null>(null);
  const [contaDoAcerto, setContaDoAcerto] = useState('');
  const [valorDoAcerto, setValorDoAcerto] = useState('');
  const [dataDoAcerto, setDataDoAcerto] = useState(new Date().toISOString().slice(0, 10));

  const [filtroTipo, setFiltroTipo] = useState<'todos' | TipoCategoria>('todos');
  const [filtroContaId, setFiltroContaId] = useState<string | null>(null);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    if (!perfilId) return;
    const cancelarContas = escutarContas(perfilId, setContas);
    const cancelarCategorias = escutarCategorias(perfilId, setCategorias);
    return () => {
      cancelarContas();
      cancelarCategorias();
    };
  }, [perfilId]);

  useEffect(() => {
    if (!ehSecundario || !meuPerfilPrincipal) {
      setMinhasContas([]);
      return;
    }
    return escutarContas(meuPerfilPrincipal.id, setMinhasContas);
  }, [ehSecundario, meuPerfilPrincipal]);

  const contasSelecionaveis = ehSecundario ? minhasContas : contas;

  useEffect(() => {
    if (!perfilId) return;
    return escutarLancamentosPorCategorias(categorias.map((c) => c.id), setLancamentos);
  }, [perfilId, categorias]);

  function limparFormulario() {
    setTipo('despesa');
    setContaId('');
    setGrupoSelecionado('');
    setCategoriaId('');
    setValor('');
    setData(new Date().toISOString().slice(0, 10));
    setDescricao('');
    setEditandoId(null);
  }

  function salvar() {
    if (contasSelecionaveis.length > 0 && !contaId) {
      mostrarAlerta('Campo obrigatório', ehSecundario ? 'Selecione de qual das suas contas saiu o dinheiro.' : 'Selecione a conta.');
      return;
    }
    if (!categoriaId) {
      mostrarAlerta('Campo obrigatório', 'Selecione o grupo e a categoria.');
      return;
    }
    const valorNumerico = parseFloat(valor.replace(',', '.'));
    if (!valorNumerico || valorNumerico <= 0) {
      mostrarAlerta('Valor inválido', 'Informe um valor maior que zero.');
      return;
    }

    const dados = {
      tipo,
      categoriaId,
      valor: valorNumerico,
      data,
      descricao,
      pagadorId: usuarioId,
      ...(contaId ? { contaId } : {}),
    };

    if (editandoId !== null) {
      dispararEscrita(atualizarLancamento(editandoId, dados).catch((erro) => {
        console.error(erro);
        mostrarAlerta('Erro ao salvar', mensagemDeErroSalvar());
      }));
    } else {
      dispararEscrita(adicionarLancamento(dados).catch((erro) => {
        console.error(erro);
        mostrarAlerta('Erro ao salvar', mensagemDeErroSalvar());
      }));
    }
    limparFormulario();
    setSalvo(true);
    setTimeout(() => setSalvo(false), 1500);
  }

  function editar(lancamento: Lancamento) {
    const categoria = categorias.find((c) => c.id === lancamento.categoriaId);
    setTipo(lancamento.tipo);
    setContaId(lancamento.contaId ?? '');
    setGrupoSelecionado(categoria?.grupo ?? '');
    setCategoriaId(lancamento.categoriaId);
    setValor(String(lancamento.valor));
    setData(lancamento.data.slice(0, 10));
    setDescricao(lancamento.descricao ?? '');
    setEditandoId(lancamento.id);
  }

  function excluir(id: string) {
    confirmarAlerta('Excluir lançamento', 'Deseja excluir este lançamento?', async () => {
      try {
        await removerLancamento(id);
      } catch (erro) {
        console.error(erro);
        mostrarAlerta('Erro ao excluir', 'Não foi possível excluir o lançamento. Tente novamente.');
      }
    });
  }

  const nomeConta = (id?: string) => (id ? contasSelecionaveis.find((c) => c.id === id)?.nome ?? contas.find((c) => c.id === id)?.nome ?? '—' : '—');
  const nomeCategoria = (id: string) => categorias.find((c) => c.id === id)?.nome ?? '—';
  const grupoDaCategoria = (id: string) => categorias.find((c) => c.id === id)?.grupo ?? '';
  const nomeMembro = (id: string) => perfilAtivo?.nomesMembros?.[id] ?? (id === usuarioId ? 'Você' : 'Alguém');

  // Primeiro filtra os grupos disponíveis para o tipo selecionado,
  // depois as categorias daquele grupo específico.
  const gruposDisponiveis = useMemo(
    () => Array.from(new Set(categorias.filter((c) => c.tipo === tipo).map((c) => c.grupo))).sort(),
    [categorias, tipo]
  );
  const categoriasFiltradas = categorias.filter((c) => c.tipo === tipo && c.grupo === grupoSelecionado);

  const lancamentosFiltrados = useMemo(() => {
    return lancamentos
      .filter((l) => (filtroTipo === 'todos' ? true : l.tipo === filtroTipo))
      .filter((l) => (filtroContaId ? l.contaId === filtroContaId : true))
      .filter((l) => {
        if (!busca.trim()) return true;
        const termo = busca.toLowerCase();
        return (
          (l.descricao ?? '').toLowerCase().includes(termo) ||
          nomeCategoria(l.categoriaId).toLowerCase().includes(termo) ||
          grupoDaCategoria(l.categoriaId).toLowerCase().includes(termo)
        );
      })
      .sort((a, b) => (a.data < b.data ? 1 : -1));
  }, [lancamentos, filtroTipo, filtroContaId, busca, categorias]);

  // Repasses já feitos dentro desse perfil (acertos entre membros), sem
  // isso, uma dívida já paga continuaria aparecendo pra sempre na lista.
  useEffect(() => {
    if (!ehSecundario || !perfilId) {
      setRepasses([]);
      return;
    }
    return escutarRepassesDoPerfil(perfilId, setRepasses);
  }, [ehSecundario, perfilId]);

  // Divisão de gastos: só faz sentido em perfil secundário com mais de um
  // membro (com 1 membro só, "dividir" com ninguém não muda nada).
  const divisao = useMemo(() => {
    if (!ehSecundario || !perfilAtivo) return null;
    const saldos = calcularDivisaoDeGastos(lancamentos, perfilAtivo.membros, repasses);
    const acertos = calcularAcertos(saldos);
    const total = saldos.reduce((soma, s) => soma + s.pago, 0);
    return { saldos, acertos, total };
  }, [ehSecundario, perfilAtivo, lancamentos, repasses]);

  function abrirFormularioDeAcerto(index: number, acerto: Acerto) {
    setAcertoAbertoIndex(index);
    setContaDoAcerto('');
    setValorDoAcerto(String(acerto.valor.toFixed(2)).replace('.', ','));
    setDataDoAcerto(new Date().toISOString().slice(0, 10));
  }

  function fecharFormularioDeAcerto() {
    setAcertoAbertoIndex(null);
    setContaDoAcerto('');
    setValorDoAcerto('');
    setDataDoAcerto(new Date().toISOString().slice(0, 10));
  }

  function confirmarEnvioDeAcerto(acerto: Acerto) {
    if (!contaDoAcerto) {
      mostrarAlerta('Campo obrigatório', 'Selecione de qual das suas contas o dinheiro saiu.');
      return;
    }
    const valorNumerico = parseFloat(valorDoAcerto.replace(',', '.'));
    if (!valorNumerico || valorNumerico <= 0) {
      mostrarAlerta('Valor inválido', 'Informe um valor maior que zero.');
      return;
    }
    if (!perfilId || !usuarioId) return;

    enviarRepasse(
      {
        perfilId,
        perfilNome: perfilAtivo?.nome || 'Perfil compartilhado',
        deUsuarioId: usuarioId,
        deUsuarioNome: usuario?.displayName || usuario?.email || 'Alguém',
        paraUsuarioId: acerto.paraUsuarioId,
        paraUsuarioNome: nomeMembro(acerto.paraUsuarioId),
        deContaId: contaDoAcerto,
        valor: valorNumerico,
        data: dataDoAcerto,
      },
      (erro) => {
        console.error(erro);
        mostrarAlerta('Erro ao registrar', mensagemDeErroSalvar());
      }
    );
    fecharFormularioDeAcerto();
  }

  if (!usuarioId) {
    return <Redirect href="/login" />;
  }

  return (
    <ScrollView contentContainerStyle={estilos.container}>
      <Cabecalho titulo={editandoId !== null ? 'Editar lançamento' : 'Novo lançamento'} />

      <Text style={estilos.label}>Tipo</Text>
      <View style={estilos.opcoes}>
        {(['despesa', 'receita'] as TipoCategoria[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[estilos.opcao, tipo === t && estilos.opcaoSelecionada]}
            onPress={() => { setTipo(t); setGrupoSelecionado(''); setCategoriaId(''); }}
          >
            <Text style={[estilos.opcaoTexto, tipo === t && estilos.opcaoTextoSelecionado]}>{t === 'despesa' ? 'Despesa' : 'Receita'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {contasSelecionaveis.length > 0 && (
        <>
          <Text style={estilos.label}>{ehSecundario ? 'Pagar com (sua conta)' : 'Conta'}</Text>
          <View style={estilos.opcoes}>
            {contasSelecionaveis.map((c) => (
              <TouchableOpacity key={c.id} style={[estilos.opcao, contaId === c.id && estilos.opcaoSelecionada]} onPress={() => setContaId(c.id)}>
                <Text style={[estilos.opcaoTexto, contaId === c.id && estilos.opcaoTextoSelecionado]}>{c.nome}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {ehSecundario && (
            <Text style={estilos.dica}>O valor será descontado dessa conta do seu perfil Pessoal.</Text>
          )}
        </>
      )}
      {ehSecundario && contasSelecionaveis.length === 0 && (
        <Text style={estilos.dica}>
          Você ainda não tem contas no seu perfil Pessoal — o gasto entra na divisão mesmo assim, só não desconta de
          conta nenhuma.
        </Text>
      )}

      <Text style={estilos.label}>Grupo</Text>
      {gruposDisponiveis.length === 0 ? (
        <Text style={estilos.dica}>Cadastre uma categoria de {tipo} primeiro.</Text>
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

      <Text style={estilos.label}>Valor (R$) *</Text>
      <TextInput style={estilos.input} placeholder="0,00" keyboardType="numeric" value={valor} onChangeText={setValor} />

      <Text style={estilos.label}>Data</Text>
      <TextInput style={estilos.input} placeholder="AAAA-MM-DD" value={data} onChangeText={setData} />

      <Text style={estilos.label}>Descrição</Text>
      <TextInput style={estilos.input} placeholder="Ex.: Mercado do mês" value={descricao} onChangeText={setDescricao} />

      <TouchableOpacity style={estilos.botao} onPress={salvar}>
        <Text style={estilos.botaoTexto}>
          {salvo ? 'Salvo ✓' : editandoId !== null ? 'Salvar alterações' : 'Salvar lançamento'}
        </Text>
      </TouchableOpacity>

      {editandoId !== null && (
        <TouchableOpacity style={estilos.botaoCancelar} onPress={limparFormulario}>
          <Text style={estilos.botaoCancelarTexto}>Cancelar edição</Text>
        </TouchableOpacity>
      )}

      {divisao && perfilAtivo && perfilAtivo.membros.length > 1 && (
        <View style={estilos.cartaoDivisao}>
          <Text style={estilos.secaoTituloSemBorda}>Divisão de gastos — {perfilAtivo.nome}</Text>
          <Text style={estilos.dica}>Total gasto: {formatarMoeda(divisao.total)} · dividido igualmente entre {perfilAtivo.membros.length} pessoas</Text>

          {divisao.saldos.map((s) => (
            <View key={s.usuarioId} style={estilos.linhaSaldo}>
              <Text style={estilos.nomeMembro}>{nomeMembro(s.usuarioId)}</Text>
              <Text style={estilos.detalheSaldo}>pagou {formatarMoeda(s.pago)} de {formatarMoeda(s.cota)}</Text>
              <Text style={[estilos.valorSaldo, { color: s.saldo >= 0 ? '#2ECC71' : '#E05C5C' }]}>
                {s.saldo >= 0 ? `a receber ${formatarMoeda(s.saldo)}` : `deve ${formatarMoeda(-s.saldo)}`}
              </Text>
            </View>
          ))}

          {divisao.acertos.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <Text style={estilos.rotuloAcertos}>Pra fechar a conta:</Text>
              {divisao.acertos.map((a, i) => (
                <View key={i} style={estilos.linhaAcerto}>
                  <View style={estilos.linhaAcertoTopo}>
                    <Text style={estilos.textoAcerto}>
                      {nomeMembro(a.deUsuarioId)} deve pagar {formatarMoeda(a.valor)} para {nomeMembro(a.paraUsuarioId)}
                    </Text>
                    {a.deUsuarioId === usuarioId && acertoAbertoIndex !== i && (
                      <TouchableOpacity onPress={() => abrirFormularioDeAcerto(i, a)}>
                        <Text style={estilos.linkMarcarPago}>Marcar como enviado</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {a.deUsuarioId === usuarioId && acertoAbertoIndex === i && (
                    <View style={estilos.formularioAcerto}>
                      <Text style={estilos.dica}>De qual das suas contas saiu o dinheiro?</Text>
                      {minhasContas.length === 0 ? (
                        <Text style={estilos.dica}>
                          Você ainda não tem contas no seu perfil Pessoal — cadastre uma em "Contas" primeiro.
                        </Text>
                      ) : (
                        <View style={estilos.opcoes}>
                          {minhasContas.map((c) => (
                            <TouchableOpacity
                              key={c.id}
                              style={[estilos.opcaoPequena, contaDoAcerto === c.id && estilos.opcaoSelecionada]}
                              onPress={() => setContaDoAcerto(c.id)}
                            >
                              <Text style={[estilos.opcaoTexto, contaDoAcerto === c.id && estilos.opcaoTextoSelecionado]}>{c.nome}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                      <Text style={estilos.label}>Valor (R$)</Text>
                      <TextInput
                        style={estilos.input}
                        keyboardType="numeric"
                        value={valorDoAcerto}
                        onChangeText={setValorDoAcerto}
                      />
                      <Text style={estilos.label}>Data</Text>
                      <TextInput
                        style={estilos.input}
                        placeholder="AAAA-MM-DD"
                        value={dataDoAcerto}
                        onChangeText={setDataDoAcerto}
                      />
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                        <TouchableOpacity style={estilos.botaoConfirmarAcerto} onPress={() => confirmarEnvioDeAcerto(a)}>
                          <Text style={estilos.botaoTexto}>Confirmar envio</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={estilos.botaoCancelarAcerto} onPress={fecharFormularioDeAcerto}>
                          <Text style={estilos.botaoCancelarTexto}>Cancelar</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={estilos.dica}>
                        {nomeMembro(a.paraUsuarioId)} vai ver que recebeu esse valor e escolher, do lado dela, pra
                        qual conta ele foi.
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <Text style={estilos.secaoTitulo}>Lançamentos</Text>

      <TextInput
        style={estilos.input}
        placeholder="Buscar por descrição, categoria ou grupo..."
        value={busca}
        onChangeText={setBusca}
      />
      <View style={[estilos.opcoes, { marginTop: 8 }]}>
        {(['todos', 'despesa', 'receita'] as const).map((t) => (
          <TouchableOpacity key={t} style={[estilos.opcaoPequena, filtroTipo === t && estilos.opcaoSelecionada]} onPress={() => setFiltroTipo(t)}>
            <Text style={[estilos.opcaoTexto, filtroTipo === t && estilos.opcaoTextoSelecionado]}>
              {t === 'todos' ? 'Todos' : t === 'despesa' ? 'Despesas' : 'Receitas'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {lancamentosFiltrados.length === 0 ? (
        <Text style={estilos.vazio}>Nenhum lançamento encontrado.</Text>
      ) : (
        lancamentosFiltrados.map((l) => (
          <CartaoLancamento
            key={l.id}
            descricao={ehSecundario && l.pagadorId ? `${l.descricao ?? ''}${l.descricao ? ' · ' : ''}pago por ${nomeMembro(l.pagadorId)}` : l.descricao ?? ''}
            categoriaNome={nomeCategoria(l.categoriaId)}
            contaNome={nomeConta(l.contaId)}
            tipo={l.tipo}
            valor={l.valor}
            data={l.data}
            onEditar={() => editar(l)}
            onExcluir={() => excluir(l.id)}
          />
        ))
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 40 },
  label: { fontSize: 14, color: '#333', marginTop: 16, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 10, fontSize: 14, color: '#222', marginTop: 8 },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcao: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  opcaoPequena: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
  opcaoSelecionada: { backgroundColor: '#2E7D9E', borderColor: '#2E7D9E' },
  opcaoTexto: { fontSize: 13, color: '#666' },
  opcaoTextoSelecionado: { color: '#FFF', fontWeight: 'bold' },
  dica: { fontSize: 12, color: '#999', fontStyle: 'italic', marginTop: 6 },
  botao: { backgroundColor: '#2E7D9E', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  botaoTexto: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  botaoCancelar: { borderWidth: 1, borderColor: '#2E7D9E', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  botaoCancelarTexto: { color: '#2E7D9E', fontSize: 16, fontWeight: 'bold' },
  secaoTitulo: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 32, marginBottom: 8, borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingTop: 16 },
  secaoTituloSemBorda: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  vazio: { fontSize: 14, color: '#777', fontStyle: 'italic', marginTop: 12 },
  cartaoDivisao: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 14, marginTop: 20 },
  linhaSaldo: { marginTop: 10 },
  nomeMembro: { fontSize: 14, fontWeight: 'bold', color: '#222' },
  detalheSaldo: { fontSize: 12, color: '#666' },
  valorSaldo: { fontSize: 13, fontWeight: 'bold', marginTop: 2 },
  rotuloAcertos: { fontSize: 13, fontWeight: 'bold', color: '#333' },
  textoAcerto: { fontSize: 13, color: '#333', flexShrink: 1, paddingRight: 8 },
  linhaAcerto: { marginTop: 8 },
  linhaAcertoTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  linkMarcarPago: { fontSize: 12, color: '#2E7D9E', fontWeight: '600' },
  formularioAcerto: { backgroundColor: '#FFF', borderRadius: 8, padding: 10, marginTop: 6, borderWidth: 1, borderColor: '#E0E0E0' },
  botaoConfirmarAcerto: { backgroundColor: '#2E7D9E', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center', flex: 1 },
  botaoCancelarAcerto: { borderWidth: 1, borderColor: '#2E7D9E', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center', flex: 1 },
});