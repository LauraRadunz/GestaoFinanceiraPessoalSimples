import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Redirect } from 'expo-router';
import Cabecalho from '../componentes/Cabecalho';
import CartaoCategoria from '../componentes/CartaoCategoria';
import SeletorDropdown from '../componentes/SeletorDropdown';
import { useUsuarioAtual } from '../hooks/useUsuarioAtual';
import { usePerfilAtual } from '../contexto/PerfilContexto';
import { adicionarCategoria, atualizarCategoria, escutarCategorias, removerCategoria } from '../services/CategoriaService';
import { confirmarAlerta, mostrarAlerta } from '../utils/alerta';
import { dispararEscrita, mensagemDeErroSalvar } from '../utils/limiteDeTempo';
import { Categoria, TipoCategoria } from '../types/Categoria';

export default function TelaCategorias() {
  const { usuario } = useUsuarioAtual();
  const usuarioId = usuario?.uid;
  const { perfilAtivo } = usePerfilAtual();
  const perfilId = perfilAtivo?.id;

  const [nome, setNome] = useState('');
  const [grupo, setGrupo] = useState('');
  const [modoNovoGrupo, setModoNovoGrupo] = useState(false);
  const [tipo, setTipo] = useState<TipoCategoria>('despesa');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    if (!perfilId) return;
    const cancelar = escutarCategorias(perfilId, setCategorias);
    return cancelar;
  }, [perfilId]);

  // Grupos já usados em alguma categoria, para popular o dropdown e evitar
  // que o usuário digite o mesmo grupo com nomes ligeiramente diferentes
  // (ex.: "Alimentação" vs "alimentacao").
  const gruposExistentes = useMemo(
    () => Array.from(new Set(categorias.map((c) => c.grupo))).sort(),
    [categorias]
  );

  if (!usuarioId) {
    return <Redirect href="/login" />;
  }

  function limparFormulario() {
    setNome('');
    setGrupo('');
    setModoNovoGrupo(gruposExistentes.length === 0);
    setTipo('despesa');
    setEditandoId(null);
  }

  function salvar() {
    if (!nome.trim() || !grupo.trim()) {
      mostrarAlerta('Campo obrigatório', 'Preencha o grupo e o nome da categoria.');
      return;
    }

    // Ver TelaContas.tsx: não esperamos a escrita terminar pra liberar o
    // formulário, só disparamos e tratamos erro real em segundo plano.
    if (editandoId !== null) {
      dispararEscrita(atualizarCategoria(editandoId, { nome, grupo, tipo }).catch((erro) => {
        console.error(erro);
        mostrarAlerta('Erro ao salvar', mensagemDeErroSalvar());
      }));
    } else {
      dispararEscrita(adicionarCategoria({ perfilId: perfilId!, nome, grupo, tipo }).catch((erro) => {
        console.error(erro);
        mostrarAlerta('Erro ao salvar', mensagemDeErroSalvar());
      }));
    }
    limparFormulario();
    setSalvo(true);
    setTimeout(() => setSalvo(false), 1500);
  }

  function editar(categoria: Categoria) {
    setNome(categoria.nome);
    setGrupo(categoria.grupo);
    setModoNovoGrupo(false);
    setTipo(categoria.tipo);
    setEditandoId(categoria.id);
  }

  function excluir(id: string, nomeDaCategoria: string) {
    confirmarAlerta('Excluir categoria', `Deseja excluir "${nomeDaCategoria}"?`, async () => {
      try {
        await removerCategoria(id);
      } catch (erro) {
        console.error(erro);
        mostrarAlerta('Erro ao excluir', 'Não foi possível excluir a categoria. Tente novamente.');
      }
    });
  }

  const grupos = Array.from(new Set(categorias.map((c) => `${c.grupo}__${c.tipo}`)));

  return (
    <ScrollView contentContainerStyle={estilos.container}>
      <Cabecalho titulo={editandoId !== null ? 'Editar categoria' : 'Nova categoria'} />

      <Text style={estilos.label}>Tipo</Text>
      <View style={estilos.opcoes}>
        {(['despesa', 'receita'] as TipoCategoria[]).map((t) => (
          <TouchableOpacity key={t} style={[estilos.opcao, tipo === t && estilos.opcaoSelecionada]} onPress={() => setTipo(t)}>
            <Text style={[estilos.opcaoTexto, tipo === t && estilos.opcaoTextoSelecionado]}>{t === 'despesa' ? 'Despesa' : 'Receita'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={estilos.label}>Grupo *</Text>
      {!modoNovoGrupo ? (
        <View style={estilos.linhaGrupo}>
          <View style={{ flex: 1 }}>
            <SeletorDropdown
              valor={grupo}
              aoMudar={setGrupo}
              itens={gruposExistentes.map((g) => ({ label: g, value: g }))}
              placeholder={gruposExistentes.length === 0 ? 'Nenhum grupo ainda' : 'Selecione um grupo...'}
            />
          </View>
          <TouchableOpacity style={estilos.botaoNovoGrupo} onPress={() => { setModoNovoGrupo(true); setGrupo(''); }}>
            <Text style={estilos.botaoNovoGrupoTexto}>+ Novo grupo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={estilos.linhaGrupo}>
          <TextInput
            style={[estilos.input, { flex: 1 }]}
            placeholder="Ex.: Alimentação, Transporte"
            value={grupo}
            onChangeText={setGrupo}
          />
          {gruposExistentes.length > 0 && (
            <TouchableOpacity style={estilos.botaoNovoGrupo} onPress={() => { setModoNovoGrupo(false); setGrupo(''); }}>
              <Text style={estilos.botaoNovoGrupoTexto}>Usar existente</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <Text style={estilos.label}>Nome da categoria *</Text>
      <TextInput style={estilos.input} placeholder="Ex.: Mercado, Uber" value={nome} onChangeText={setNome} />

      <TouchableOpacity style={estilos.botao} onPress={salvar}>
        <Text style={estilos.botaoTexto}>
          {salvo ? 'Salvo ✓' : editandoId !== null ? 'Salvar alterações' : 'Salvar categoria'}
        </Text>
      </TouchableOpacity>

      {editandoId !== null && (
        <TouchableOpacity style={estilos.botaoCancelar} onPress={limparFormulario}>
          <Text style={estilos.botaoCancelarTexto}>Cancelar edição</Text>
        </TouchableOpacity>
      )}

      <Text style={estilos.secaoTitulo}>Categorias cadastradas</Text>

      {categorias.length === 0 ? (
        <Text style={estilos.vazio}>Nenhuma categoria cadastrada.</Text>
      ) : (
        grupos.map((chave) => {
          const [nomeGrupo, tipoGrupo] = chave.split('__');
          const itens = categorias.filter((c) => c.grupo === nomeGrupo && c.tipo === tipoGrupo);
          return (
            <View key={chave}>
              <Text style={estilos.grupoTitulo}>
                {nomeGrupo} ({tipoGrupo === 'receita' ? 'Receita' : 'Despesa'})
              </Text>
              {itens.map((c) => (
                <CartaoCategoria key={c.id} nome={c.nome} tipo={c.tipo} onEditar={() => editar(c)} onExcluir={() => excluir(c.id, c.nome)} />
              ))}
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
  linhaGrupo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  botaoNovoGrupo: { paddingVertical: 10, paddingHorizontal: 10 },
  botaoNovoGrupoTexto: { color: '#2E7D9E', fontSize: 12, fontWeight: 'bold' },
  opcoes: { flexDirection: 'row', gap: 8 },
  opcao: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  opcaoSelecionada: { backgroundColor: '#2E7D9E', borderColor: '#2E7D9E' },
  opcaoTexto: { fontSize: 13, color: '#666' },
  opcaoTextoSelecionado: { color: '#FFF', fontWeight: 'bold' },
  botao: { backgroundColor: '#2E7D9E', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  botaoTexto: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  botaoCancelar: { borderWidth: 1, borderColor: '#2E7D9E', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  botaoCancelarTexto: { color: '#2E7D9E', fontSize: 16, fontWeight: 'bold' },
  secaoTitulo: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 32, marginBottom: 8, borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingTop: 16 },
  grupoTitulo: { fontSize: 13, fontWeight: 'bold', color: '#666', marginTop: 12, textTransform: 'uppercase' },
  vazio: { fontSize: 14, color: '#777', fontStyle: 'italic', marginTop: 8 },
});
