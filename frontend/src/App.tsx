import { Provider } from "./components/ui/provider"
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.tsx';
import OAuthCallback from './pages/OAuthCallback.tsx';

const DashboardPlaceholder = () => (
  <div style={{ padding: '32px' }}>
    <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Панель управления CustomInventory</h1>
    <p style={{ marginTop: '8px', color: '#4A5568' }}>Вы успешно вошли в систему!</p>
  </div>
);

export default function App() {
  return (
    <Provider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="/dashboard" element={<DashboardPlaceholder />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}