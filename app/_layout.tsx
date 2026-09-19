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
      </Stack>
    </PerfilProvider>
  );
}
