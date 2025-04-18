import { BrowserRouter } from 'react-router-dom';
import { DirectionProvider } from './context/DirectionContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes/index';

function App() {
  return (
    <ThemeProvider>
      <DirectionProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </DirectionProvider>
    </ThemeProvider>
  );
}

export default App;