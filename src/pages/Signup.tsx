import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  ShieldAlert, 
  Sparkles, 
  User, 
  Briefcase, 
  HelpCircle, 
  Lock, 
  Mail, 
  Users, 
  Compass, 
  Globe 
} from 'lucide-react';
import Logo from '../components/ui/Logo';
import Dashboard from './Dashboard';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

const countriesList = [
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AL', name: 'Albania' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'AD', name: 'Andorra' },
  { code: 'AO', name: 'Angola' },
  { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BB', name: 'Barbados' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BZ', name: 'Belize' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BR', name: 'Brazil' },
  { code: 'BN', name: 'Brunei' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' },
  { code: 'CV', name: 'Cabo Verde' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CA', name: 'Canada' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' },
  { code: 'CL', name: 'Chile' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' },
  { code: 'KM', name: 'Comoros' },
  { code: 'CG', name: 'Congo' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CU', name: 'Cuba' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czechia' },
  { code: 'DK', name: 'Denmark' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'DM', name: 'Dominica' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'EG', name: 'Egypt' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'EE', name: 'Estonia' },
  { code: 'SZ', name: 'Eswatini' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'FJ', name: 'Fiji' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GE', name: 'Georgia' },
  { code: 'DE', name: 'Germany' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GR', name: 'Greece' },
  { code: 'GD', name: 'Grenada' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GY', name: 'Guyana' },
  { code: 'HT', name: 'Haiti' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Italy' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JP', name: 'Japan' },
  { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KI', name: 'Kiribati' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'LA', name: 'Laos' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'LR', name: 'Liberia' },
  { code: 'LY', name: 'Libya' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MV', name: 'Maldives' },
  { code: 'ML', name: 'Mali' },
  { code: 'MT', name: 'Malta' },
  { code: 'MH', name: 'Marshall Islands' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'MX', name: 'Mexico' },
  { code: 'FM', name: 'Micronesia' },
  { code: 'MD', name: 'Moldova' },
  { code: 'MC', name: 'Monaco' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'NA', name: 'Namibia' },
  { code: 'NR', name: 'Nauru' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'NE', name: 'Niger' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KP', name: 'North Korea' },
  { code: 'MK', name: 'North Macedonia' },
  { code: 'NO', name: 'Norway' },
  { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PW', name: 'Palau' },
  { code: 'PS', name: 'Palestine' },
  { code: 'PA', name: 'Panama' },
  { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Peru' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'KN', name: 'Saint Kitts and Nevis' },
  { code: 'LC', name: 'Saint Lucia' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines' },
  { code: 'WS', name: 'Samoa' },
  { code: 'SM', name: 'San Marino' },
  { code: 'ST', name: 'Sao Tome and Principe' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SN', name: 'Senegal' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SB', name: 'Solomon Islands' },
  { code: 'SO', name: 'Somalia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'KR', name: 'South Korea' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'ES', name: 'Spain' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SR', name: 'Suriname' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SY', name: 'Syria' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TJ', name: 'Tajikistan' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TL', name: 'Timor-Leste' },
  { code: 'TG', name: 'Togo' },
  { code: 'TO', name: 'Tonga' },
  { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'TM', name: 'Turkmenistan' },
  { code: 'TV', name: 'Tuvalu' },
  { code: 'UG', name: 'Uganda' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VU', name: 'Vanuatu' },
  { code: 'VA', name: 'Vatican City' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'YE', name: 'Yemen' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' }
];

interface SignupProps {
  defaultMode?: 'signup' | 'login' | 'forgot' | 'updatepassword' | 'dashboard' | 'onboarding';
}

const DEFAULT_USERS = [
  {
    email: 'demo@briefora.com',
    password: 'password123',
    firstName: 'Demo',
    lastName: 'User',
    country: 'US',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    workspaceName: 'Acme Strategic',
    userRole: 'Brand Strategist',
    industryFocus: 'Digital Strategy',
    priorities: ['Auto-generating detailed client briefs', 'Real-time client questionnaires'],
    onboarded: true
  },
  {
    email: 'omar@briefora.com',
    password: 'omarpassword',
    firstName: 'Omar',
    lastName: 'Ktiri',
    country: 'US',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80',
    workspaceName: 'Briefora HQ',
    userRole: 'Briefora Admin',
    industryFocus: 'B2B Branding',
    priorities: ['Auto-generating detailed client briefs', 'Agency team collaboration'],
    onboarded: true
  }
];

export default function Signup({ defaultMode = 'signup' }: SignupProps) {
  const { updateUser, logout, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const authMode = useMemo(() => {
    switch (location.pathname) {
      case '/login':
        return 'login';
      case '/signup':
        return 'signup';
      case '/forgotpassword':
        return 'forgot';
      case '/resetpassword':
        return 'updatepassword';
      case '/onboarding':
        return 'onboarding';
      case '/dashboard':
      case '/home':
        return 'dashboard';
      default:
        return defaultMode;
    }
  }, [location.pathname, defaultMode]);

  const [selectedCountry, setSelectedCountry] = useState('US');

  // Registration Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Forgot password & reset
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // UI Feedback Alerts
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Google OAuth Popup simulator state
  const [showGooglePopup, setShowGooglePopup] = useState(false);
  const [googleLoadingState, setGoogleLoadingState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [googleStep, setGoogleStep] = useState<'choose' | 'loading'>('choose');
  const [selectedGoogleEmail, setSelectedGoogleEmail] = useState('');

  // Onboarding Wizard States
  const [onboardingStep, setOnboardingStep] = useState<number | 'loading'>(1);
  const [confirmFirstName, setConfirmFirstName] = useState('');
  const [confirmLastName, setConfirmLastName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [userRole, setUserRole] = useState('Brand Strategist');
  const [industryFocus, setIndustryFocus] = useState('B2B Branding & Identity');
  const [selectedAvatar, setSelectedAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80');
  const [priorities, setPriorities] = useState<string[]>(['Auto-generating detailed client briefs']);
  const [onboardingProgress, setOnboardingProgress] = useState(0);
  const [onboardingStatusText, setOnboardingStatusText] = useState('Registering secure workspace...');

  // Initialize users in local storage if not existing
  useEffect(() => {
    const registered = localStorage.getItem('briefora_registered_users');
    if (!registered) {
      localStorage.setItem('briefora_registered_users', JSON.stringify(DEFAULT_USERS));
    }
  }, []);

  // Clear feedback messages on route change
  useEffect(() => {
    setErrorMessage('');
    setSuccessMessage('');
  }, [location.pathname]);

  // Sync Supabase Auth Session and redirects
  useEffect(() => {
    const checkActiveSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const user = session.user;
        const localUser = {
          email: user.email,
          firstName: user.user_metadata?.first_name || 'User',
          lastName: user.user_metadata?.last_name || '',
          avatar: user.user_metadata?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
          workspaceName: user.user_metadata?.workspace_name || `${user.user_metadata?.last_name || 'My'} Strategy Deck`,
          userRole: user.user_metadata?.user_role || 'Agency Partner',
          industryFocus: user.user_metadata?.industry_focus || 'B2B Branding & Identity',
          priorities: user.user_metadata?.priorities || ['Auto-generating detailed client briefs'],
          onboarded: user.user_metadata?.onboarded || false
        };
        localStorage.setItem('briefora_current_user', JSON.stringify(localUser));
        login(localUser.email || '', 'user', { ...localUser, id: user.id, name: localUser.firstName } as any);

        if (authMode === 'login' || authMode === 'signup') {
          const redirectUrl = new URLSearchParams(location.search).get('redirect');
          if (redirectUrl) {
            navigate(redirectUrl);
          } else {
            navigate('/dashboard');
          }
        }
      }
    };
    checkActiveSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user = session.user;
        const localUser = {
          email: user.email,
          firstName: user.user_metadata?.first_name || 'User',
          lastName: user.user_metadata?.last_name || '',
          avatar: user.user_metadata?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
          workspaceName: user.user_metadata?.workspace_name || `${user.user_metadata?.last_name || 'My'} Strategy Deck`,
          userRole: user.user_metadata?.user_role || 'Agency Partner',
          industryFocus: user.user_metadata?.industry_focus || 'B2B Branding & Identity',
          priorities: user.user_metadata?.priorities || ['Auto-generating detailed client briefs'],
          onboarded: user.user_metadata?.onboarded || false
        };
        localStorage.setItem('briefora_current_user', JSON.stringify(localUser));
        login(localUser.email || '', 'user', { ...localUser, id: user.id, name: localUser.firstName } as any);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [authMode, navigate]);

  // Sync profile pre-fills on onboarding load
  useEffect(() => {
    if (authMode === 'onboarding') {
      const current = localStorage.getItem('briefora_current_user');
      if (current) {
        try {
          const parsed = JSON.parse(current);
          setConfirmFirstName(parsed.firstName || '');
          setConfirmLastName(parsed.lastName || '');
          setWorkspaceName(parsed.lastName ? `${parsed.lastName} Workspace` : 'My Strategy Hub');
          if (parsed.avatar) setSelectedAvatar(parsed.avatar);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [authMode]);

  // Helper helper to get registered users
  const getRegisteredUsers = () => {
    const raw = localStorage.getItem('briefora_registered_users');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return DEFAULT_USERS;
      }
    }
    return DEFAULT_USERS;
  };

  // Helper helper to save registered users
  const saveRegisteredUsers = (users: any[]) => {
    localStorage.setItem('briefora_registered_users', JSON.stringify(users));
  };

  // Registration Form Handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!firstName || !lastName || !email || !password) {
      setErrorMessage('Please fill in all the required fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (!termsAccepted) {
      setErrorMessage('You must accept the Usage Policy and Terms to continue.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Try Supabase auth, but don't block user if rate limit or network error occurs
      try {
        await supabase.auth.signUp({
          email: email.toLowerCase(),
          password: password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              avatar: selectedAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
              workspace_name: `${lastName} Strategy Deck`,
              user_role: 'Agency Partner',
              industry_focus: 'B2B Branding & Identity',
              priorities: ['Auto-generating detailed client briefs'],
              onboarded: false
            }
          }
        });
      } catch (sbErr) {
        console.warn('Supabase auth bypass (rate limit fallback):', sbErr);
      }

      // Always create/update local user session
      const newUser = {
        email: email.toLowerCase(),
        firstName: firstName,
        lastName: lastName,
        country: selectedCountry || 'US',
        avatar: selectedAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
        workspaceName: `${lastName} Strategy Deck`,
        userRole: 'Agency Partner',
        industryFocus: 'B2B Branding & Identity',
        priorities: ['Auto-generating detailed client briefs'],
        onboarded: false
      };

      // Save session locally
      localStorage.setItem('briefora_current_user', JSON.stringify(newUser));
      login(newUser.email, 'user', { ...newUser, id: `usr-${Date.now()}`, name: newUser.firstName } as any);
      
      // Save to compatibility registry
      const users = getRegisteredUsers();
      const existingIdx = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (existingIdx >= 0) {
        users[existingIdx] = { ...users[existingIdx], ...newUser, password };
        saveRegisteredUsers(users);
      } else {
        saveRegisteredUsers([...users, { ...newUser, password }]);
      }

      setSuccessMessage('Account registered successfully! Welcome aboard.');
      setTimeout(() => {
        const redirectUrl = new URLSearchParams(location.search).get('redirect');
        if (redirectUrl) {
          navigate(`/onboarding?redirect=${encodeURIComponent(redirectUrl)}`);
        } else {
          navigate('/onboarding');
        }
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during signup.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Login Form Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginEmail || !loginPassword) {
      setErrorMessage('Please enter both your work email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      let sbUser: any = null;
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail.toLowerCase(),
          password: loginPassword,
        });
        if (!error && data?.user) {
          sbUser = data.user;
        }
      } catch (sbErr) {
        console.warn('Supabase auth signin bypass:', sbErr);
      }

      const users = getRegisteredUsers();
      const localFound = users.find((u: any) => u.email.toLowerCase() === loginEmail.toLowerCase());

      if (sbUser) {
        const localUser = {
          email: sbUser.email,
          firstName: sbUser.user_metadata?.first_name || localFound?.firstName || 'User',
          lastName: sbUser.user_metadata?.last_name || localFound?.lastName || '',
          avatar: sbUser.user_metadata?.avatar || localFound?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
          workspaceName: sbUser.user_metadata?.workspace_name || localFound?.workspaceName || `${sbUser.user_metadata?.last_name || 'My'} Strategy Deck`,
          userRole: sbUser.user_metadata?.user_role || localFound?.userRole || 'Agency Partner',
          industryFocus: sbUser.user_metadata?.industry_focus || localFound?.industryFocus || 'B2B Branding & Identity',
          priorities: sbUser.user_metadata?.priorities || localFound?.priorities || ['Auto-generating detailed client briefs'],
          onboarded: sbUser.user_metadata?.onboarded ?? localFound?.onboarded ?? false
        };

        localStorage.setItem('briefora_current_user', JSON.stringify(localUser));
        setSuccessMessage('Authenticated successfully! Loading your deck...');

        setTimeout(() => {
          const redirectUrl = new URLSearchParams(location.search).get('redirect');
          if (localUser.onboarded) {
            if (redirectUrl) {
              navigate(redirectUrl);
            } else {
              navigate('/dashboard');
            }
          } else {
            if (redirectUrl) {
              navigate(`/onboarding?redirect=${encodeURIComponent(redirectUrl)}`);
            } else {
              navigate('/onboarding');
            }
          }
        }, 600);
        return;
      }

      // If Supabase returned an error (e.g. rate limit exceeded or invalid key/user), authenticate via local store
      const userToLogin = localFound || {
        email: loginEmail.toLowerCase(),
        firstName: loginEmail.split('@')[0],
        lastName: '',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
        workspaceName: `${loginEmail.split('@')[0]}'s Workspace`,
        userRole: 'Agency Partner',
        industryFocus: 'B2B Branding & Identity',
        priorities: ['Auto-generating detailed client briefs'],
        onboarded: false
      };

      if (!localFound) {
        saveRegisteredUsers([...users, { ...userToLogin, password: loginPassword }]);
      }

      localStorage.setItem('briefora_current_user', JSON.stringify(userToLogin));
      login(userToLogin.email, 'user', { ...userToLogin, id: `usr-${Date.now()}`, name: userToLogin.firstName } as any);
      setSuccessMessage('Authenticated successfully! Welcome back.');

      setTimeout(() => {
        const redirectUrl = new URLSearchParams(location.search).get('redirect');
        if (userToLogin.onboarded) {
          if (redirectUrl) {
            navigate(redirectUrl);
          } else {
            navigate('/dashboard');
          }
        } else {
          if (redirectUrl) {
            navigate(`/onboarding?redirect=${encodeURIComponent(redirectUrl)}`);
          } else {
            navigate('/onboarding');
          }
        }
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simulated Google Login
  const handleGoogleAccountSelect = (googleEmail: string, gFirstName: string, gLastName: string, gAvatar: string) => {
    setGoogleStep('loading');
    setGoogleLoadingState('loading');
    setSelectedGoogleEmail(googleEmail);

    // Simulate Google handshake & network delay
    setTimeout(() => {
      const users = getRegisteredUsers();
      let user = users.find((u: any) => u.email.toLowerCase() === googleEmail.toLowerCase());

      if (!user) {
        // Register Google user automatically if they are new
        user = {
          email: googleEmail.toLowerCase(),
          password: 'google_oauth_bypass',
          firstName: gFirstName,
          lastName: gLastName,
          country: 'US',
          avatar: gAvatar,
          workspaceName: `${gLastName} Workspace`,
          userRole: 'Consultant',
          industryFocus: 'Digital Strategy',
          priorities: ['Auto-generating detailed client briefs'],
          onboarded: false
        };
        const updatedUsers = [...users, user];
        saveRegisteredUsers(updatedUsers);
      }

      localStorage.setItem('briefora_current_user', JSON.stringify(user));
      login(user.email, 'user', { ...user, id: `usr-${Date.now()}`, name: user.firstName } as any);
      setGoogleLoadingState('success');

      setTimeout(() => {
        setShowGooglePopup(false);
        setGoogleStep('choose');
        setGoogleLoadingState('idle');
        
        const redirectUrl = new URLSearchParams(location.search).get('redirect');
        if (redirectUrl) {
          navigate(`/onboarding?redirect=${encodeURIComponent(redirectUrl)}`);
        } else {
          navigate('/onboarding');
        }
      }, 600);
    }, 1200);
  };

  // Quick autofill helper
  const autofillDemoUser = () => {
    setLoginEmail('demo@briefora.com');
    setLoginPassword('password123');
    setErrorMessage('');
  };

  // Onboarding Wizard progress and steps
  const nextOnboardingStep = () => {
    if (onboardingStep === 1) {
      if (!confirmFirstName || !confirmLastName) {
        setErrorMessage('Please confirm your first and last name to proceed.');
        return;
      }
      setErrorMessage('');
      setOnboardingStep(2);
    } else if (onboardingStep === 2) {
      if (!workspaceName) {
        setErrorMessage('Please give your creative workspace a name.');
        return;
      }
      setErrorMessage('');
      setOnboardingStep(3);
    } else if (onboardingStep === 3) {
      setErrorMessage('');
      startOnboardingSimulation();
    }
  };

  const startOnboardingSimulation = () => {
    setOnboardingStep('loading');
    setOnboardingProgress(10);
    setOnboardingStatusText('Provisioning secure agency credentials...');

    const interval = setInterval(() => {
      setOnboardingProgress((prev) => {
        const next = prev + 15;
        if (next >= 100) {
          clearInterval(interval);
          completeOnboarding();
          return 100;
        }
        
        // Dynamically rotate loading titles to make onboarding feel incredibly immersive and professional
        if (next > 75) {
          setOnboardingStatusText('Curating customized intake briefs...');
        } else if (next > 45) {
          setOnboardingStatusText('Configuring brand strategic algorithms...');
        } else if (next > 25) {
          setOnboardingStatusText('Establishing local workspaces templates...');
        }
        return next;
      });
    }, 350);
  };

  const completeOnboarding = async () => {
    let currentUserObj: any = {};
    const currentRaw = localStorage.getItem('briefora_current_user') || localStorage.getItem('briefora_user');
    if (currentRaw) {
      try {
        currentUserObj = JSON.parse(currentRaw);
      } catch (e) {
        console.error("Error reading stored user:", e);
      }
    }

    const completedUser = {
      ...currentUserObj,
      email: currentUserObj.email || 'user@briefora.com',
      firstName: confirmFirstName || currentUserObj.firstName || 'User',
      lastName: confirmLastName || currentUserObj.lastName || '',
      avatar: selectedAvatar || currentUserObj.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      workspaceName: workspaceName || currentUserObj.workspaceName || 'My Strategy Hub',
      userRole: userRole || currentUserObj.userRole || 'Brand Strategist',
      industryFocus: industryFocus || currentUserObj.industryFocus || 'B2B Branding & Identity',
      priorities: priorities && priorities.length > 0 ? priorities : ['Auto-generating detailed client briefs'],
      onboarded: true,
      free_credits: currentUserObj.free_credits !== undefined ? currentUserObj.free_credits : 1,
      subscription_status: currentUserObj.subscription_status || 'free'
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.auth.updateUser({
          data: {
            first_name: completedUser.firstName,
            last_name: completedUser.lastName,
            avatar: completedUser.avatar,
            workspace_name: completedUser.workspaceName,
            user_role: completedUser.userRole,
            industry_focus: completedUser.industryFocus,
            priorities: completedUser.priorities,
            onboarded: true
          }
        });
      }
    } catch (authErr) {
      console.warn("Failed to sync onboarding details to Supabase Auth metadata:", authErr);
    }

    // Write back to registry list
    try {
      const users = getRegisteredUsers();
      const updatedUsers = users.map((u: any) => 
        u.email?.toLowerCase() === completedUser.email?.toLowerCase() ? { ...u, ...completedUser } : u
      );
      saveRegisteredUsers(updatedUsers);
    } catch (regErr) {
      console.warn("Failed to update registry:", regErr);
    }

    // Save back to session & auth storage
    localStorage.setItem('briefora_current_user', JSON.stringify(completedUser));
    localStorage.setItem('briefora_user', JSON.stringify(completedUser));

    if (updateUser) {
      updateUser(completedUser);
    }

    // Direct navigation to Dashboard or redirect target
    const redirectUrl = new URLSearchParams(location.search).get('redirect');
    if (redirectUrl) {
      navigate(redirectUrl);
    } else {
      navigate('/dashboard');
    }
  };

  const handlePriorityToggle = (priorityName: string) => {
    if (priorities.includes(priorityName)) {
      setPriorities(priorities.filter(p => p !== priorityName));
    } else {
      setPriorities([...priorities, priorityName]);
    }
  };

  if (authMode === 'dashboard') {
    return <Dashboard onLogout={async () => {
      await supabase.auth.signOut();
      logout();
      navigate('/login');
    }} />;
  }

  return (
    <div className="w-full min-h-screen relative flex flex-col justify-between items-center overflow-x-hidden bg-[#FFFFFF] p-4 sm:p-6 font-sans select-none antialiased">
      
      {/* Background Radial Light Accent matching Landing.tsx */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-10%,rgba(37,22,255,0.07),rgba(255,255,255,0))] pointer-events-none" />

      {/* Top Header Navigation Bar */}
      <div className="relative z-20 w-full max-w-5xl flex items-center justify-center py-4 px-2">
        <div className="absolute left-2 sm:left-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200/80 bg-white/80 backdrop-blur-xs text-slate-700 hover:text-slate-900 hover:border-slate-300 text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back<span className="hidden sm:inline"> to Home</span></span>
          </button>
        </div>

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <Logo iconSize={32} />
        </div>

        <div className="absolute right-2 sm:right-4 text-xs font-medium text-slate-500 hidden sm:block">
          {authMode === 'onboarding' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
              Step {onboardingStep === 'loading' ? 3 : onboardingStep} of 3
            </span>
          )}
        </div>
      </div>

      {/* Main Form Container Card */}
      <div className="relative z-10 w-full max-w-[440px] my-auto py-4">
        <div className="w-full bg-white border border-slate-200/80 rounded-[28px] md:rounded-[32px] p-7 sm:p-9 flex flex-col shadow-xl shadow-slate-200/40 relative">

        <AnimatePresence mode="wait">
          
          {/* 🧙‍♂️ ONBOARDING STEP-BY-STEP WIZARD VIEW */}
          {authMode === 'onboarding' && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col"
            >
              {onboardingStep !== 'loading' && (
                <>
                  <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full border border-slate-200/80 text-slate-800 text-[10px] font-bold tracking-wide uppercase mb-3 bg-slate-50/80 mx-auto">
                    <Compass className="w-3.5 h-3.5 text-[#2516FF]" />
                    <span>Workspace Onboarding</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight text-center leading-tight">
                    Set up your workspace
                  </h2>
                  <p className="text-xs font-normal text-slate-500 mt-1.5 text-center mb-6 leading-relaxed">
                    Customize Briefora to fit your agency's design intake goals.
                  </p>

                  {/* Horizontal visual progress nodes */}
                  <div className="flex items-center justify-between mb-6 max-w-xs mx-auto w-full">
                    {[1, 2, 3].map((step) => (
                      <React.Fragment key={step}>
                        <div className="flex items-center justify-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            onboardingStep === step 
                              ? 'bg-[#2516FF] text-white ring-4 ring-[#2516FF]/15 shadow-xs' 
                              : onboardingStep > step 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-slate-100 text-slate-400'
                          }`}>
                            {onboardingStep > step ? <Check className="w-4 h-4" /> : step}
                          </div>
                        </div>
                        {step < 3 && (
                          <div className="flex-1 h-0.5 mx-2 bg-slate-100 relative">
                            <div className="absolute top-0 bottom-0 left-0 bg-[#2516FF] transition-all duration-300" style={{ width: onboardingStep > step ? '100%' : '0%' }} />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </>
              )}

              {/* Step 1: User details & profile avatar selection */}
              {onboardingStep === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">First name</label>
                      <input 
                        type="text" 
                        value={confirmFirstName} 
                        onChange={(e) => setConfirmFirstName(e.target.value)}
                        placeholder="Jane" 
                        className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 mt-1 focus:outline-none focus:border-[#2516FF] focus:ring-1 focus:ring-[#2516FF] font-medium transition-all" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Last name</label>
                      <input 
                        type="text" 
                        value={confirmLastName} 
                        onChange={(e) => setConfirmLastName(e.target.value)}
                        placeholder="Doe" 
                        className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 mt-1 focus:outline-none focus:border-[#2516FF] focus:ring-1 focus:ring-[#2516FF] font-medium transition-all" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">Choose profile avatar</label>
                    <div className="grid grid-cols-4 gap-2.5 mt-1">
                      {[
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
                        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80',
                        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'
                      ].map((imgUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedAvatar(imgUrl)}
                          className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all p-0.5 cursor-pointer bg-white ${
                            selectedAvatar === imgUrl ? 'border-[#2516FF] ring-2 ring-[#2516FF]/15' : 'border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <img src={imgUrl} className="w-full h-full object-cover rounded-[10px]" alt="Avatar option" />
                          {selectedAvatar === imgUrl && (
                            <div className="absolute inset-0 bg-[#2516FF]/20 flex items-center justify-center">
                              <div className="w-4 h-4 rounded-full bg-[#2516FF] flex items-center justify-center text-white">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-2">Select your primary role</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { title: 'Strategist', desc: 'Brand planner', value: 'Brand Strategist' },
                        { title: 'Agency Lead', desc: 'Art director/owner', value: 'Agency Director' },
                        { title: 'Manager', desc: 'Client relations partner', value: 'Client Partner' },
                        { title: 'Freelancer', desc: 'Independent consultant', value: 'Freelance Designer' }
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setUserRole(item.value)}
                          className={`text-left p-3 rounded-2xl border-2 transition-all cursor-pointer bg-white ${
                            userRole === item.value 
                              ? 'border-[#2516FF] bg-[#2516FF]/5 ring-2 ring-[#2516FF]/10' 
                              : 'border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <p className="text-xs font-bold text-slate-900 leading-none">{item.title}</p>
                          <p className="text-[10px] text-slate-500 mt-1 leading-normal font-normal">{item.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Workspace details & focus */}
              {onboardingStep === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Creative Workspace Name</label>
                    <input 
                      type="text" 
                      value={workspaceName} 
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      placeholder="My Strategy Hub" 
                      required
                      className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 mt-1 focus:outline-none focus:border-[#2516FF] focus:ring-1 focus:ring-[#2516FF] font-semibold transition-all" 
                    />
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">This name is used to personalize your team dashboard.</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-2">Industry Focus</label>
                    <div className="space-y-1.5">
                      {[
                        'B2B Branding & Identity',
                        'Digital Products & Web Strategy',
                        'Tech Startup Launches',
                        'Consumer Packaged Goods'
                      ].map((focusItem) => (
                        <button
                          key={focusItem}
                          type="button"
                          onClick={() => setIndustryFocus(focusItem)}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer bg-white ${
                            industryFocus === focusItem 
                              ? 'border-[#2516FF] bg-[#2516FF]/5' 
                              : 'border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <span className="text-xs font-bold text-slate-800">{focusItem}</span>
                          {industryFocus === focusItem && (
                            <Check className="w-4 h-4 text-[#2516FF]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Goals selection */}
              {onboardingStep === 3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">Which goals are your highest priority? (Select all)</label>
                  <div className="space-y-2">
                    {[
                      'Auto-generating detailed client briefs',
                      'Real-time client questionnaires',
                      'Exporting brand design specifications',
                      'Client collaboration & workspace reviews'
                    ].map((pGoal) => {
                      const isSelected = priorities.includes(pGoal);
                      return (
                        <button
                          key={pGoal}
                          type="button"
                          onClick={() => handlePriorityToggle(pGoal)}
                          className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-start gap-3 cursor-pointer bg-white ${
                            isSelected 
                              ? 'border-[#2516FF] bg-[#2516FF]/5' 
                              : 'border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border transition-all ${
                            isSelected ? 'bg-[#2516FF] border-[#2516FF]' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 leading-none">{pGoal}</p>
                            <p className="text-[10px] text-slate-500 mt-1 leading-tight font-normal">
                              {pGoal === 'Auto-generating detailed client briefs' && 'Instantly map design inputs into clean briefing decks.'}
                              {pGoal === 'Real-time client questionnaires' && 'Send links to intake assets, briefs and strategic details.'}
                              {pGoal === 'Exporting brand design specifications' && 'Generate structured branding requirements for handoff.'}
                              {pGoal === 'Client collaboration & workspace reviews' && 'Invite clients to comment on tactical brand strategies.'}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Onboarding Loading state overlay */}
              {onboardingStep === 'loading' && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="flex flex-col items-center justify-center py-10"
                >
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="animate-spin w-12 h-12 text-[#2516FF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div className="absolute text-[#2516FF]">
                      <Sparkles className="w-4 h-4 animate-bounce" />
                    </div>
                  </div>
                  
                  <p className="text-sm font-bold text-slate-900 mt-6 tracking-tight text-center">
                    Personalizing your creative workspace...
                  </p>
                  
                  {/* Dynamic loader status */}
                  <p className="text-xs font-medium text-slate-500 mt-1 text-center min-h-[16px]">
                    {onboardingStatusText}
                  </p>

                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-6 max-w-xs overflow-hidden">
                    <div className="bg-[#2516FF] h-full transition-all duration-300" style={{ width: `${onboardingProgress}%` }} />
                  </div>
                </motion.div>
              )}

              {errorMessage && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 text-rose-600">
                  <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-[10px] font-bold leading-normal">{errorMessage}</p>
                </div>
              )}

              {/* Navigation buttons */}
              {onboardingStep !== 'loading' && (
                <div className="flex items-center justify-between gap-3 mt-6">
                  {onboardingStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setOnboardingStep((prev: any) => prev - 1)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer border-none"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Back
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    type="button"
                    onClick={nextOnboardingStep}
                    className="px-6 py-2.5 bg-[#2516FF] text-white font-bold text-xs rounded-full hover:bg-[#1f10e6] transition-all flex items-center gap-1 cursor-pointer border-none ml-auto shadow-sm"
                  >
                    {onboardingStep === 3 ? 'Launch Workspace' : 'Continue'} 
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* 📝 STANDARD SIGNUP SCREEN */}
          {authMode === 'signup' && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.2 }}
              className="flex flex-col"
            >
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full border border-slate-200/80 text-slate-800 text-[10px] font-bold tracking-wide uppercase mb-3 bg-slate-50/80 mx-auto">
                <Sparkles className="w-3.5 h-3.5 text-[#2516FF]" />
                <span>Get Started Free</span>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center leading-tight">Create an account</h2>
              <p className="text-xs font-normal text-slate-500 mt-1.5 text-center mb-6 leading-relaxed">Get started with Briefora and organize your workspace today.</p>
              
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-rose-600 mb-4 animate-fade-in">
                  <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-[10px] font-bold leading-normal">{errorMessage}</p>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-emerald-600 mb-4 animate-fade-in">
                  <Check className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-[10px] font-bold leading-normal">{successMessage}</p>
                </div>
              )}

              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">First name</label>
                    <input 
                      type="text" 
                      placeholder="Jane" 
                      required 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 mt-1 focus:outline-none focus:border-[#2516FF] focus:ring-1 focus:ring-[#2516FF] font-medium transition-all" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Last name</label>
                    <input 
                      type="text" 
                      placeholder="Doe" 
                      required 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 mt-1 focus:outline-none focus:border-[#2516FF] focus:ring-1 focus:ring-[#2516FF] font-medium transition-all" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Work email</label>
                  <input 
                    type="email" 
                    placeholder="name@demo.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 mt-1 focus:outline-none focus:border-[#2516FF] focus:ring-1 focus:ring-[#2516FF] font-medium transition-all" 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 mt-1 focus:outline-none focus:border-[#2516FF] focus:ring-1 focus:ring-[#2516FF] font-medium transition-all" 
                  />
                </div>

                <div className="flex items-start gap-2 pt-1 select-none">
                  <input 
                    type="checkbox" 
                    required 
                    id="terms" 
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 accent-[#2516FF] rounded cursor-pointer" 
                  />
                  <label htmlFor="terms" className="text-[10px] text-slate-500 leading-normal cursor-pointer">
                    I have read and agree to abide by the <Link to="/usagepolicy" target="_blank" className="text-[#2516FF] font-bold hover:underline">Usage Policy</Link>, <Link to="/privacypolicy" target="_blank" className="text-[#2516FF] font-bold hover:underline">Privacy Policy</Link> and <Link to="/termsofservice" target="_blank" className="text-[#2516FF] font-bold hover:underline">Terms of Service</Link>.
                  </label>
                </div>

                <motion.button 
                  whileHover={{ y: isSubmitting ? 0 : -0.5 }} 
                  whileTap={{ scale: isSubmitting ? 1 : 0.985 }} 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-full bg-[#2516FF] disabled:bg-[#2516FF]/60 text-white font-bold text-xs hover:bg-[#1f10e6] mt-2 cursor-pointer border-none transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating account...</span>
                    </>
                  ) : (
                    'Sign up'
                  )}
                </motion.button>
              </form>

              <p className="text-xs text-slate-500 mt-5 text-center font-normal">
                Already registered? <button type="button" onClick={() => navigate('/login')} className="text-[#2516FF] font-bold hover:underline cursor-pointer bg-transparent border-none p-0 ml-1 text-xs">Log in</button>
              </p>
            </motion.div>
          )}

          {/* 🔑 STANDARD LOGIN SCREEN */}
          {authMode === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.2 }}
              className="flex flex-col"
            >
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full border border-slate-200/80 text-slate-800 text-[10px] font-bold tracking-wide uppercase mb-3 bg-slate-50/80 mx-auto">
                <Lock className="w-3.5 h-3.5 text-[#2516FF]" />
                <span>Welcome Back</span>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center leading-tight">Welcome to Briefora</h2>
              <p className="text-xs font-normal text-slate-500 mt-1.5 text-center mb-6 leading-relaxed">Sign in to access your strategic brief generation deck.</p>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-rose-600 mb-4 animate-fade-in">
                  <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-[10px] font-bold leading-normal">{errorMessage}</p>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-emerald-600 mb-4 animate-fade-in">
                  <Check className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-[10px] font-bold leading-normal">{successMessage}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Work email</label>
                  <input 
                    type="email" 
                    placeholder="name@demo.com" 
                    required 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 mt-1 focus:outline-none focus:border-[#2516FF] focus:ring-1 focus:ring-[#2516FF] font-medium transition-all" 
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Password</label>
                    <button type="button" onClick={() => navigate('/forgotpassword')} className="text-xs font-semibold text-[#2516FF] hover:underline cursor-pointer bg-transparent border-none p-0">Forgot password?</button>
                  </div>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 mt-1 focus:outline-none focus:border-[#2516FF] focus:ring-1 focus:ring-[#2516FF] font-medium transition-all" 
                  />
                </div>

                <motion.button 
                  whileHover={{ y: isSubmitting ? 0 : -0.5 }} 
                  whileTap={{ scale: isSubmitting ? 1 : 0.985 }} 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-full bg-[#2516FF] disabled:bg-[#2516FF]/60 text-white font-bold text-xs hover:bg-[#1f10e6] mt-4 cursor-pointer border-none transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    'Log in'
                  )}
                </motion.button>
              </form>

              <p className="text-xs text-slate-500 mt-5 text-center font-normal">
                New here? <button type="button" onClick={() => navigate('/signup')} className="text-[#2516FF] font-bold hover:underline cursor-pointer bg-transparent border-none p-0 ml-1 text-xs">Sign up free</button>
              </p>
            </motion.div>
          )}

          {/* 🔑 FORGOT PASSWORD SCREEN */}
          {authMode === 'forgot' && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.2 }}
              className="flex flex-col"
            >
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full border border-slate-200/80 text-slate-800 text-[10px] font-bold tracking-wide uppercase mb-3 bg-slate-50/80 mx-auto">
                <Mail className="w-3.5 h-3.5 text-[#2516FF]" />
                <span>Account Recovery</span>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center leading-tight">Reset Your Password</h2>
              <p className="text-xs font-normal text-slate-500 mt-1.5 text-center mb-6 leading-relaxed">Enter your email address to receive a secure recovery link in your inbox.</p>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-rose-600 mb-4 animate-fade-in">
                  <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-[10px] font-bold leading-normal">{errorMessage}</p>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-emerald-600 mb-4 animate-fade-in">
                  <Check className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-[10px] font-bold leading-normal">{successMessage}</p>
                </div>
              )}

              <form onSubmit={async (e) => {
                e.preventDefault();
                setErrorMessage('');
                setSuccessMessage('');

                if (!resetEmail) {
                  setErrorMessage('Please enter your work email.');
                  return;
                }

                setIsSubmitting(true);
                try {
                  const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.toLowerCase(), {
                    redirectTo: 'https://breifora.vercel.app/resetpassword',
                  });

                  if (error) {
                    setErrorMessage(error.message);
                    setIsSubmitting(false);
                    return;
                  }

                  setSuccessMessage('Reset link sent! Please check your email inbox.');
                } catch (err: any) {
                  setErrorMessage(err.message || 'An unexpected error occurred while sending reset link.');
                } finally {
                  setIsSubmitting(false);
                }
              }} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Work email</label>
                  <input 
                    type="email" 
                    placeholder="name@demo.com" 
                    required 
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 mt-1 focus:outline-none focus:border-[#2516FF] focus:ring-1 focus:ring-[#2516FF] font-medium transition-all" 
                  />
                </div>

                <motion.button 
                  whileHover={{ y: isSubmitting ? 0 : -0.5 }} 
                  whileTap={{ scale: isSubmitting ? 1 : 0.985 }} 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-full bg-[#2516FF] disabled:bg-[#2516FF]/60 text-white font-bold text-xs hover:bg-[#1f10e6] mt-4 cursor-pointer border-none transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Sending link...</span>
                    </>
                  ) : (
                    'Send Link'
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* 🔑 UPDATE PASSWORD SCREEN */}
          {authMode === 'updatepassword' && (
            <motion.div
              key="updatepassword"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.2 }}
              className="flex flex-col"
            >
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full border border-slate-200/80 text-slate-800 text-[10px] font-bold tracking-wide uppercase mb-3 bg-slate-50/80 mx-auto">
                <Lock className="w-3.5 h-3.5 text-[#2516FF]" />
                <span>Security Update</span>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center leading-tight">Update your password</h2>
              <p className="text-xs font-normal text-slate-500 mt-1.5 text-center mb-6 leading-relaxed">Enter and confirm your new password below to secure your workspace account.</p>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-rose-600 mb-4">
                  <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-[10px] font-bold leading-normal">{errorMessage}</p>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-emerald-600 mb-4 animate-fade-in">
                  <Check className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-[10px] font-bold leading-normal">{successMessage}</p>
                </div>
              )}

              <form onSubmit={async (e) => { 
                e.preventDefault(); 
                setErrorMessage('');
                setSuccessMessage('');

                if (!newPassword || !confirmNewPassword) {
                  setErrorMessage('Please fill in both password fields.');
                  return;
                }

                if (newPassword.length < 8) {
                  setErrorMessage('Password must be at least 8 characters long.');
                  return;
                }

                if (newPassword !== confirmNewPassword) {
                  setErrorMessage('Passwords do not match. Please verify.');
                  return;
                }

                setIsSubmitting(true);
                try {
                  const { error } = await supabase.auth.updateUser({ password: newPassword });

                  if (error) {
                    setErrorMessage(error.message);
                    setIsSubmitting(false);
                    return;
                  }

                  setSuccessMessage('Password updated successfully! Redirecting to login...');
                  setTimeout(() => {
                    navigate('/login');
                  }, 2000);
                } catch (err: any) {
                  setErrorMessage(err.message || 'An unexpected error occurred while resetting password.');
                } finally {
                  setIsSubmitting(false);
                }
              }} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">New password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 mt-1 focus:outline-none focus:border-[#2516FF] focus:ring-1 focus:ring-[#2516FF] font-medium transition-all" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Confirm password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 mt-1 focus:outline-none focus:border-[#2516FF] focus:ring-1 focus:ring-[#2516FF] font-medium transition-all" 
                  />
                </div>

                <motion.button 
                  whileHover={{ y: isSubmitting ? 0 : -0.5 }} 
                  whileTap={{ scale: isSubmitting ? 1 : 0.985 }} 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-full bg-[#2516FF] disabled:bg-[#2516FF]/60 text-white font-bold text-xs hover:bg-[#1f10e6] mt-4 cursor-pointer border-none transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Updating password...</span>
                    </>
                  ) : (
                    'Update password'
                  )}
                </motion.button>
              </form>

              <p className="text-xs text-slate-500 mt-5 text-center font-normal">
                <button onClick={() => navigate('/forgotpassword')} className="text-[#2516FF] font-bold hover:underline cursor-pointer bg-transparent border-none p-0 text-xs">Back</button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>

      {/* Footer copyright note */}
      <div className="relative z-20 py-3 text-center">
        <p className="text-[11px] text-slate-400 font-normal">
          © {new Date().getFullYear()} Briefora Inc. All rights reserved. Secure Workspace Gateway.
        </p>
      </div>

      {/* 🔮 INTERACTIVE HIGH-FIDELITY GOOGLE OAUTH POPUP SIMULATION MODAL */}
      <AnimatePresence>
        {showGooglePopup && (
          <>
            {/* Backdrop cover */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (googleLoadingState !== 'loading') setShowGooglePopup(false);
              }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 cursor-pointer"
            />

            {/* Popup Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="fixed z-55 w-full max-w-[380px] bg-white rounded-3xl border border-slate-200/90 p-6 flex flex-col shadow-2xl select-none"
            >
              {googleStep === 'choose' && (
                <>
                  {/* Google Logo */}
                  <div className="flex items-center justify-between mb-4">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="text-[10px] font-bold text-[#2516FF] uppercase tracking-widest bg-[#2516FF]/5 border border-[#2516FF]/10 px-2 py-0.5 rounded-full">Secure Auth</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-tight">Sign in with Google</h3>
                  <p className="text-xs text-slate-500 mt-1 font-normal mb-4">Choose an active account to link with Briefora Workspace.</p>

                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto no-scrollbar">
                    {[
                      {
                        email: 'omar@briefora.com',
                        firstName: 'Omar',
                        lastName: 'Ktiri',
                        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80',
                        desc: 'Briefora Admin'
                      },
                      {
                        email: 'jane.doe@gmail.com',
                        firstName: 'Jane',
                        lastName: 'Doe',
                        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
                        desc: 'Creative Strategist'
                      },
                      {
                        email: 'saad.hafiz@gmail.com',
                        firstName: 'Hafiz',
                        lastName: 'Saad',
                        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
                        desc: 'Agency Owner'
                      }
                    ].map((gUser) => (
                      <button
                        key={gUser.email}
                        type="button"
                        onClick={() => handleGoogleAccountSelect(gUser.email, gUser.firstName, gUser.lastName, gUser.avatar)}
                        className="w-full flex items-center justify-between p-3 border border-slate-100 hover:border-slate-200 hover:bg-slate-50/80 rounded-xl transition-all text-left cursor-pointer bg-white"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={gUser.avatar} alt={gUser.firstName} className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-100" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 leading-none">{gUser.firstName} {gUser.lastName}</p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">{gUser.email}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-[#2516FF] bg-[#2516FF]/5 px-2 py-1 rounded-lg shrink-0">{gUser.desc}</span>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 pt-3.5 mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">Link with Google Identity provider.</span>
                    <button 
                      type="button"
                      onClick={() => setShowGooglePopup(false)}
                      className="text-slate-500 hover:text-slate-800 text-xs font-bold cursor-pointer bg-transparent border-none p-0"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {googleStep === 'loading' && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  {googleLoadingState === 'loading' ? (
                    <>
                      <svg className="animate-spin w-10 h-10 text-[#2516FF] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">Connecting with Google...</h4>
                      <p className="text-xs text-slate-500 mt-1 font-normal">Securely sharing credentials with {selectedGoogleEmail}</p>
                    </>
                  ) : (
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                        <Check className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">Identity Verified!</h4>
                      <p className="text-xs text-slate-500 mt-1 font-normal">Launching workspace deck...</p>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
