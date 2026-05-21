import { Provider } from "./components/ui/provider"
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import OAuthCallback from './pages/OAuthCallback.tsx';

// Временная заглушка для страницы конкретного инвентаря
const InventoryDetailsPlaceholder = () => (
  <div style={{ padding: '32px' }}>
    <h2>Внутренняя страница инвентаря со вкладками (В разработке)</h2>
  </div>
);

export default function App() {
  return (
    <Provider>
      <BrowserRouter>
        <Routes>
          {/* Главная страница теперь полноценный компонент Home */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          
          {/* Динамический роут для страницы конкретного инвентаря */}
          <Route path="/inventory/:id" element={<InventoryDetailsPlaceholder />} />
          
          {/* Редиректы */}
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}