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

export function PerfilProvider({ children }: { children: ReactNode }) {
  const { usuario } = useUsuarioAtual();
  const usuarioId = usuario?.uid;
  const nomeExibicao = usuario?.displayName || usuario?.email || undefined;

  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [carregandoPerfis, setCarregandoPerfis] = useState(true);
  const [perfilAtivoId, setPerfilAtivoId] = useState<string | null>(null);
  const criandoPerfilPara = useRef<string | null>(null);

  useEffect(() => {
    // Ao trocar de usuário (login/logout), esquece a seleção anterior.
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

  useEffect(() => {
    if (!usuarioId || carregandoPerfis || perfis.length > 0) return;
    if (criandoPerfilPara.current === usuarioId) return;
    criandoPerfilPara.current = usuarioId;
    try {
      criarPerfilPrincipal(usuarioId, nomeExibicao);
    } catch (erro) {
      console.error('[PerfilContexto] Não foi possível criar o perfil principal automaticamente:', erro);
      criandoPerfilPara.current = null;
    }
  }, [usuarioId, carregandoPerfis, perfis.length, nomeExibicao]);

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
