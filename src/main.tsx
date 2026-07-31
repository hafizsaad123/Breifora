import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.tsx';
import Signup from './pages/Signup.tsx';
import AdminPortal from './pages/AdminPortal.tsx';
import { ErrorBoundary } from './components/ui/ErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/signup" element={<Signup defaultMode="signup" />} />
          <Route path="/login" element={<Signup defaultMode="login" />} />
          <Route path="/forgotpassword" element={<Signup defaultMode="forgot" />} />
          <Route path="/resetpassword" element={<Signup defaultMode="updatepassword" />} />
          <Route path="/onboarding" element={<Signup defaultMode="onboarding" />} />
          <Route path="/home" element={<Signup defaultMode="dashboard" />} />
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
