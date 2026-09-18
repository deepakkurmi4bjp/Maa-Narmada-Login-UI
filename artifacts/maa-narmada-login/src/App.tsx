import { type FormEvent, type ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Apple, ArrowRight, Check, Chrome, Eye, EyeOff, Facebook, KeyRound, ShieldCheck, UserRound } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type SocialProvider = 'Google' | 'Apple' | 'Facebook';

function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('');
  const [signedIn, setSignedIn] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!username.trim() || !password.trim()) {
      setSignedIn(false);
      setStatus('कृपया उपयोगकर्ता नाम और पासवर्ड भरें।');
      return;
    }

    setSignedIn(true);
    setStatus('लॉगिन सफल रहा — सेवा में आपका स्वागत है।');
  }

  function handleForgotPassword() {
    setSignedIn(false);
    setStatus('पासवर्ड रीसेट करने के लिए निर्देश आपके ईमेल पर भेजे जाएंगे।');
  }

  function handleSocial(provider: SocialProvider) {
    setSignedIn(false);
    setStatus(`${provider} से जारी रखने के लिए चयनित किया गया।`);
  }

  function handleSignup() {
    setSignedIn(false);
    setStatus('साइन अप सुविधा शीघ्र उपलब्ध होगी।');
  }

  return (
    <main className="login-page" data-testid="page-login">
      <section className="reference-stage" aria-label="श्री माँ नर्मदा भक्त परिवार एडमिन पैनल">
        {status && (
          <div className="sr-status" role="status" aria-live="polite" data-testid="status-feedback">
            {status}
          </div>
        )}

        <section className="login-card" data-testid="card-login">
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="card-heading">
              <span className="card-heading-icon" aria-hidden="true">
                <ShieldCheck />
              </span>
              <div>
                <h1>एडमिन पैनल लॉगिन</h1>
                <p>सेवा में समर्पित, पारदर्शिता के लिए प्रतिबद्ध</p>
              </div>
            </div>

            <div className="field-stack">
              <label className="field-wrap">
                <UserRound aria-hidden="true" />
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="उपयोगकर्ता नाम / ईमेल"
                  autoComplete="username"
                  aria-label="उपयोगकर्ता नाम / ईमेल"
                  data-testid="input-username"
                />
              </label>

              <label className="field-wrap">
                <KeyRound aria-hidden="true" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="पासवर्ड"
                  autoComplete="current-password"
                  aria-label="पासवर्ड"
                  data-testid="input-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'पासवर्ड छुपाएं' : 'पासवर्ड दिखाएं'}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </label>
            </div>

            <div className="forgot-row">
              <button
                type="button"
                className="forgot-button"
                onClick={handleForgotPassword}
                data-testid="button-forgot-password"
              >
                पासवर्ड भूल गए?
              </button>
            </div>

            <button
              type="submit"
              className={`submit-button${signedIn ? ' success' : ''}`}
              data-testid="button-login"
            >
              {signedIn ? 'लॉगिन सफल' : 'लॉगिन करें'}
              <span className="arrow" aria-hidden="true">
                {signedIn ? <Check /> : <ArrowRight />}
              </span>
            </button>

            <div className="divider" aria-hidden="true">या इसके द्वारा जारी रखें</div>

            <div className="social-row" aria-label="सोशल साइन इन विकल्प">
              <button
                type="button"
                className="social-button google"
                onClick={() => handleSocial('Google')}
                aria-label="Google से जारी रखें"
                data-testid="button-social-google"
              >
                <Chrome />
              </button>
              <button
                type="button"
                className="social-button apple"
                onClick={() => handleSocial('Apple')}
                aria-label="Apple से जारी रखें"
                data-testid="button-social-apple"
              >
                <Apple />
              </button>
              <button
                type="button"
                className="social-button facebook"
                onClick={() => handleSocial('Facebook')}
                aria-label="Facebook से जारी रखें"
                data-testid="button-social-facebook"
              >
                <Facebook />
              </button>
            </div>

            <p className="signup-copy">
              क्या आपके पास खाता नहीं है?
              <button type="button" className="signup-link" onClick={handleSignup} data-testid="button-signup">
                साइन अप करें
              </button>
            </p>
          </form>
        </section>

        <button
          type="button"
          className="blessing-hotspot"
          onClick={() => setStatus('“माँ नर्मदा का आशीर्वाद हमारे हर सेवा कार्य की शक्ति है।”')}
          aria-label="माँ नर्मदा का आशीर्वाद"
          data-testid="button-blessing"
        />
        <span className="sr-only">माँ नर्मदा का आशीर्वाद हमारे हर सेवा कार्य की शक्ति है।</span>
      </section>
    </main>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;