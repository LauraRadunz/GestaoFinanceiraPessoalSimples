import { Stack } from 'expo-router';
import { PerfilProvider } from '../src/contexto/PerfilContexto';

export default function Layout() {
  return (
    <PerfilProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="cadastro" />
        <Stack.Screen name="perfis" />
        <Stack.Screen name="contas" />
        <Stack.Screen name="categorias" />
<<<<<<< HEAD
        <Stack.Screen name="lancamentos" />
=======
>>>>>>> dccad0bf6c13c0cc0f1ea7700258fb83db96d2fc
      </Stack>
    </PerfilProvider>
  );
}
