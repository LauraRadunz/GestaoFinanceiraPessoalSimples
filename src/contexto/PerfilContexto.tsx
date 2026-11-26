import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { useUsuarioAtual } from '../hooks/useUsuarioAtual';
import { criarPerfilPrincipal, escutarPerfis } from '../services/PerfilService';
import { Perfil } from '../types/Perfil';

type PerfilContextoTipo = {
  perfis: Perfil[];
  perfilAtivo: Perfil | null;
  carregandoPerfis: boolean;
  definirPerfilAtivo: (perfilId: string) => void;
};

const PerfilContexto = createContext<PerfilContextoTipo | undefined>(undefined);

/**
 * Guarda, para todo o app, a lista de perfis do usuário logado, o
 * "Pessoal" + os que ele criou ou aceitou compartilhar, e qual deles está
 * ativo no momento. As telas (Contas, Categorias, Lançamentos etc) usam
 * usePerfilAtual() para saber em qual perfil ler/gravar dados, do mesmo
 * jeito que useUsuarioAtual() diz qual é o usuário logado.
 */
export function PerfilProvider({ children }: { children: ReactNode }) {
  const { usuario } = useUsuarioAtual();
  const usuarioId = usuario?.uid;
  const nomeExibicao = usuario?.displayName || usuario?.email || undefined;

  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [carregandoPerfis, setCarregandoPerfis] = useState(true);
  const [perfilAtivoId, setPerfilAtivoId] = useState<string | null>(null);
  const criandoPerfilPara = useRef<string | null>(null);

  // quando loga ou desloga zera tudo e começa a escutar os perfis do usuario
  useEffect(() => {
    setPerfilAtivoId(null);
    criandoPerfilPara.current = null;
    if (!usuarioId) {
      setPerfis([]);
      setCarregandoPerfis(false);
      return;
    }
    setCarregandoPerfis(true);
    const cancelar = escutarPerfis(usuarioId, (lista) => {
      setPerfis(lista);
      setCarregandoPerfis(false);
    });
    return cancelar;
  }, [usuarioId]);


  // se carregou e o usuario nao tem nenhum perfil cria o Pessoal
  // o useRef é pra nao criar duas vezes enquanto o primeiro ainda nao voltou do banco
  useEffect(() => {
    if (!usuarioId || carregandoPerfis || perfis.length > 0) return;
    if (criandoPerfilPara.current === usuarioId) return;
    criandoPerfilPara.current = usuarioId;
    criarPerfilPrincipal(usuarioId, nomeExibicao).catch((erro) => {
      console.error('[PerfilContexto] Não foi possível criar o perfil principal automaticamente:', erro);
      criandoPerfilPara.current = null; // libera pra tentar de novo
    });
  }, [usuarioId, carregandoPerfis, perfis.length, nomeExibicao]);


  // se nao tem perfil ativo ou o ativo foi excluído volta pro Pessoal
  useEffect(() => {
    if (perfis.length === 0) return;
    const aindaExiste = perfis.some((p) => p.id === perfilAtivoId);
    if (!perfilAtivoId || !aindaExiste) {
      const principal = perfis.find((p) => p.tipo === 'principal');
      setPerfilAtivoId(principal?.id ?? perfis[0].id);
    }
  }, [perfis, perfilAtivoId]);

  const perfilAtivo = useMemo(
    () => perfis.find((p) => p.id === perfilAtivoId) ?? null,
    [perfis, perfilAtivoId]
  );

  return (
    <PerfilContexto.Provider value={{ perfis, perfilAtivo, carregandoPerfis, definirPerfilAtivo: setPerfilAtivoId }}>
      {children}
    </PerfilContexto.Provider>
  );
}

export function usePerfilAtual() {
  const contexto = useContext(PerfilContexto);
  if (!contexto) {
    throw new Error('usePerfilAtual precisa ser usado dentro de um <PerfilProvider>.');
  }
  return contexto;
}
