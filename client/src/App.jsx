import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { getDDragonVersion } from './utils/dataDragon';
import HomePage from './pages/HomePage';
import LobbyPage from './pages/LobbyPage';
import SetupPage from './pages/SetupPage';
import GamePage from './pages/GamePage';
import ShopPage from './pages/ShopPage';

const ProtectedRoute = ({ children }) => {
  const { user, token } = useAuthStore();
  if (!user && !token) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  const { loadMe } = useAuthStore();

  useEffect(() => {
    // Boot: load auth and prime DDragon version cache
    loadMe();
    getDDragonVersion().catch(() => {});
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                        element={<HomePage />} />
        <Route path="/lobby"                   element={<ProtectedRoute><LobbyPage /></ProtectedRoute>} />
        <Route path="/campaign/:id/setup"      element={<ProtectedRoute><SetupPage /></ProtectedRoute>} />
        <Route path="/campaign/:id"            element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
        <Route path="/campaign/:id/shop"       element={<ProtectedRoute><ShopPage /></ProtectedRoute>} />
        <Route path="*"                        element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
