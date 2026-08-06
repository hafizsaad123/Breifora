import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.tsx';
import Signup from './pages/Signup.tsx';
import VerifyEmail from './pages/VerifyEmail.tsx';
import AuthGuard from './guards/AuthGuard.tsx';
import Dashboard from './pages/Dashboard.tsx';
import BriefsList from './pages/BriefsList.tsx';
import BriefNew from './pages/BriefNew.tsx';
import BriefDetail from './pages/BriefDetail.tsx';
import Settings from './pages/Settings.tsx';
import ClientForm from './pages/public/ClientForm.tsx';
import ClientFormComplete from './pages/public/ClientFormComplete.tsx';
import AdminPortal from './pages/AdminPortal.tsx';
import PrivacyPolicy from './pages/PrivacyPolicy.tsx';
import UsagePolicy from './pages/UsagePolicy.tsx';
import TermsOfService from './pages/TermsOfService.tsx';
import ContactUs from './pages/ContactUs.tsx';
import Checkout from './pages/Checkout.tsx';
import { ErrorBoundary } from './components/ui/ErrorBoundary.tsx';
import { AppSettingsProvider } from './context/AppSettingsContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppSettingsProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/signup" element={<Signup defaultMode="signup" />} />
              <Route path="/login" element={<Signup defaultMode="login" />} />
              <Route path="/forgotpassword" element={<Signup defaultMode="forgot" />} />
              <Route path="/resetpassword" element={<Signup defaultMode="updatepassword" />} />
              <Route path="/onboarding" element={<AuthGuard><Signup defaultMode="onboarding" /></AuthGuard>} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/brief/:id" element={<ClientForm />} />
              <Route path="/brief/:id/complete" element={<ClientFormComplete />} />
              <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
              <Route path="/home" element={<AuthGuard><Dashboard /></AuthGuard>} />
              <Route path="/briefs" element={<AuthGuard><BriefsList /></AuthGuard>} />
              <Route path="/briefs/new" element={<AuthGuard><BriefNew /></AuthGuard>} />
              <Route path="/briefs/:id" element={<AuthGuard><BriefDetail /></AuthGuard>} />
              <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
              <Route path="/admin" element={<AuthGuard><AdminPortal /></AuthGuard>} />
              <Route path="/checkout" element={<AuthGuard><Checkout /></AuthGuard>} />
              <Route path="/privacypolicy" element={<PrivacyPolicy />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/usagepolicy" element={<UsagePolicy />} />
              <Route path="/usage-policy" element={<UsagePolicy />} />
              <Route path="/termsofservice" element={<TermsOfService />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/contactus" element={<ContactUs />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AppSettingsProvider>
    </ErrorBoundary>
  </StrictMode>,
);
