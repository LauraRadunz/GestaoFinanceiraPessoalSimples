import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { observarUsuario } from '../services/AutenticacaoService';

/**
 * Hook que expõe o usuário logado no momento (ou null, se ninguém estiver
 * logado), um indicador de carregamento inicial, e um indicador de
 * "demorando" (true se o Firebase não respondeu depois de alguns segundos
 * — útil para mostrar uma mensagem de erro em vez de deixar a tela de
 * carregamento girando para sempre).
 */
export function useUsuarioAtual() {
  // Começa já com auth.currentUser (o Firebase guarda isso em memória
  // assim que resolve pela 1ª vez) em vez de null. Sem isso, toda tela
  // que usa este hook começa achando "ninguém logado" por um instante,
  // mesmo logo depois de um login bem-sucedido — o suficiente para telas
  // protegidas (<Redirect href="/login" /> se !usuarioId) mandarem de
  // volta para o login antes do estado real chegar, causando aquele
  // "pisca e volta pro login".
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
