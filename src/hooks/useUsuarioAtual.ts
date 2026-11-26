import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { getUsuarioAtual, observarUsuario } from '../services/AutenticacaoService';


// toda tela usa isso pra saber quem ta logado
// demorando vira true se passar 8s sem resposta, ai o layout mostra uma dica
export function useUsuarioAtual() {
  const [usuario, setUsuario] = useState<User | null>(getUsuarioAtual());
  const [carregando, setCarregando] = useState(!getUsuarioAtual());
  const [demorando, setDemorando] = useState(false);

  useEffect(() => {
    const cancelarInscricao = observarUsuario((u) => {
      setUsuario(u);
      setCarregando(false);
    });


    const tempoLimite = setTimeout(() => setDemorando(true), 8000);

    return () => {
      cancelarInscricao();
      clearTimeout(tempoLimite);
    };
  }, []);

  return { usuario, carregando, demorando };
}
