import { createTheme, ThemeProvider } from '@mui/material';
import Viewer from './components/Viewer';

function App() {
  const theme = createTheme({
    typography: {
      fontFamily: ['Open Sans', 'sans-serif'].join(','),
    },
    palette: {
      primary: {
        main: '#1C6DA6'
      },
      secondary: {
        main: '#15396C'
      }
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <Viewer />
    </ThemeProvider>
  );
}

export default App;
