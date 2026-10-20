import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { observarUsuario } from '../services/AutenticacaoService';


export function useUsuarioAtual() {
<<<<<<< HEAD

=======
  
>>>>>>> dccad0bf6c13c0cc0f1ea7700258fb83db96d2fc
  const [usuario, setUsuario] = useState<User | null>(auth.currentUser);
  const [carregando, setCarregando] = useState(!auth.currentUser);
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
