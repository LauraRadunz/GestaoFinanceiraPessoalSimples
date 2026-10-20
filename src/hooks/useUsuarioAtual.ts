import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { observarUsuario } from '../services/AutenticacaoService';


export function useUsuarioAtual() {

  const [usuario, setUsuario] = useState<User | null>(auth.currentUser);
  const [carregando, setCarregando] = useState(!auth.currentUser);
  const [demorando, setDemorando] = useState(false);

  useEffect(() => {
    const cancelarInscricao = observarUsuario((u) => {
      setUsuario(u);
      setCarregando(false);
    });

    // Se depois de 8 segundos o Firebase ainda não respondeu, algo está
    // errado (credenciais inválidas, sem internet, projeto mal configurado).
    const tempoLimite = setTimeout(() => setDemorando(true), 8000);

    return () => {
      cancelarInscricao();
      clearTimeout(tempoLimite);
    };
  }, []);

  return { usuario, carregando, demorando };
}
