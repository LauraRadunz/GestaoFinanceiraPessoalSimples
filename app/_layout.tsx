import { Stack } from 'expo-router';
import { useUsuarioAtual } from '../src/hooks/useUsuarioAtual';
import { PerfilProvider } from '../src/contexto/PerfilContexto';
import TelaCarregando from '../src/telas/TelaCarregando';

const screenOptions = { headerStyle: { backgroundColor: '#fff' }, headerTintColor: '#222' };

export default function Layout() {
  const { carregando, demorando } = useUsuarioAtual();

  // Enquanto o Firebase ainda não respondeu se há alguém logado, mostra
  // uma tela de carregamento simples. Se demorar demais, mostra uma dica
  // em vez de travar para sempre sem explicação.
  if (carregando) {
    return (
      <TelaCarregando
        mensagem={
          demorando
            ? 'Isso está demorando mais que o normal.\nVerifique sua conexão e as credenciais em src/services/firebase.ts.'
            : undefined
        }
      />
    );
  }

  return (
    <PerfilProvider>
      <Stack screenOptions={screenOptions}>
        <Stack.Screen name="index" options={{ title: 'Finanças App' }} />
        <Stack.Screen name="perfis" options={{ title: 'Perfis' }} />
        <Stack.Screen name="contas" options={{ title: 'Contas' }} />
        <Stack.Screen name="categorias" options={{ title: 'Categorias' }} />
        <Stack.Screen name="lancamentos" options={{ title: 'Lançamentos' }} />
        <Stack.Screen name="transferencias" options={{ title: 'Transferências' }} />
        <Stack.Screen name="metas" options={{ title: 'Metas' }} />
        <Stack.Screen name="orcamento" options={{ title: 'Orçamento' }} />
        <Stack.Screen name="login" options={{ title: 'Entrar' }} />
        <Stack.Screen name="cadastro" options={{ title: 'Criar conta' }} />
      </Stack>
    </PerfilProvider>
  );
}
