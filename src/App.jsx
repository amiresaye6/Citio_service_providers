import { BrowserRouter } from 'react-router-dom';
import { DirectionProvider } from './context/DirectionContext';
import AppRoutes from './routes/index';

function App() {
  return (
    <DirectionProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </DirectionProvider>
  );
}

export default App;