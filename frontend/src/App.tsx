import { Provider } from "./components/ui/provider"
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import OAuthCallback from './pages/OAuthCallback.tsx';
import InventoryDetail from './pages/InventoryDetail'; // Твой настоящий компонент

export default function App() { 
  return (
    <Provider>
      <BrowserRouter>
        <Routes>
          {/* Главная страница */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          
          {/* ИСПРАВЛЕНО: Теперь здесь рендерится полноценный InventoryDetail с вкладками */}
          <Route path="/inventory/:id" element={<InventoryDetail />} />
          
          {/* Редиректы */}
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}