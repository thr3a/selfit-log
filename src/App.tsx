import '@mantine/core/styles.css';
import { Container, MantineProvider, Title } from '@mantine/core';
import { ColorSchemeToggle } from './ColorSchemeToggle/ColorSchemeToggle';
import { Welcome } from './Welcome/Welcome';
import { theme } from './theme';

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <Container id='container' maw={400}>
        <Title mt={'sm'} order={2}>
          Mantine Vite template
        </Title>
        <Title order={6} mb={'sm'} c={'dimmed'}>
          Mantine Vite template
        </Title>
        <Welcome />
        <ColorSchemeToggle />
      </Container>
    </MantineProvider>
  );
}
