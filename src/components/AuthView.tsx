import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  UserPlus,
  LogIn,
  Terminal,
  KeyRound
} from 'lucide-react';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from '../lib/firebase';
import { setAuthToken } from '../lib/api';

interface AuthViewProps {
  onAuthenticated: (user: { uid: string; email: string; name?: string }) => void;
  error?: string | null;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthenticated, error: initialError }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [devAdminLoading, setDevAdminLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(initialError || null);
  const [devAdminAvailable, setDevAdminAvailable] = useState<boolean>(false);

  // Check if Dev Admin is available on backend
  useEffect(() => {
    let isMounted = true;
    fetch('/api/dev-admin/status')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data && data.enabled === true) {
          setDevAdminAvailable(true);
        }
      })
      .catch(() => {
        // Dev Admin status endpoint unreachable or disabled
        if (isMounted) setDevAdminAvailable(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDevAdminLogin = async () => {
    setDevAdminLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/dev-admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Falha no login administrativo de desenvolvimento');
      }

      if (data.token) {
        setAuthToken(data.token);
      }

      onAuthenticated({
        uid: data.user.uid,
        email: data.user.email,
        name: data.user.name,
      });
    } catch (err: any) {
      console.error('Dev Admin login failed:', err);
      setErrorMsg(err.message || 'Erro ao conectar em modo Dev Admin.');
    } finally {
      setDevAdminLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Por favor, informe seu email.');
      setLoading(false);
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('A senha deve possuir no mínimo 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      let userCredential;
      if (mode === 'login') {
        userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      }

      const idToken = await userCredential.user.getIdToken();
      setAuthToken(idToken);

      // Synchronize authenticated user profile with backend database
      try {
        await fetch('/api/auth/sync-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            name: name || userCredential.user.displayName || cleanEmail.split('@')[0],
          }),
        });
      } catch (syncErr) {
        console.warn('User profile sync notice:', syncErr);
      }

      onAuthenticated({
        uid: userCredential.user.uid,
        email: userCredential.user.email || cleanEmail,
        name: name || userCredential.user.displayName || cleanEmail.split('@')[0],
      });
    } catch (err: any) {
      console.error('Authentication error:', err);
      let message = 'Falha na autenticação. Verifique suas credenciais.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Email ou senha incorretos.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'Este email já está cadastrado. Faça login ou use outro email.';
      } else if (err.code === 'auth/weak-password') {
        message = 'A senha informada é muito fraca.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Formato de email inválido.';
      } else if (err.message) {
        message = err.message;
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-view-container" className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Product OS Discovery Engine</h1>
          <p className="text-xs text-slate-400">
            Autenticação Segura & Gestão Multi-Tenant
          </p>
        </div>

        {/* DEV ADMIN BANNER (Rendered ONLY if NODE_ENV=development and ALLOW_DEV_ADMIN=true) */}
        {devAdminAvailable && (
          <div id="dev-admin-container" className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                <Terminal className="w-3.5 h-3.5" />
                <span>Modo de Desenvolvimento Ativo</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                DEV ADMIN
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Acesso administrativo local habilitado via variável de ambiente (<code className="text-amber-300 font-mono">ALLOW_DEV_ADMIN=true</code>).
            </p>
            <button
              id="btn-dev-admin-login"
              type="button"
              onClick={handleDevAdminLogin}
              disabled={devAdminLoading}
              className="w-full py-2 px-3 rounded-md bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition shadow"
            >
              {devAdminLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Conectando como Admin...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Entrar como Admin (Desenvolvimento)</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-800 text-xs">
          <button
            id="tab-login"
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`flex-1 py-2.5 font-medium border-b-2 transition flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Entrar com Firebase
          </button>
          <button
            id="tab-register"
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); }}
            className={`flex-1 py-2.5 font-medium border-b-2 transition flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Criar Conta
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form: Login / Register */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Nome Completo</label>
              <input
                id="input-auth-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Email Corporativo</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                id="input-auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@empresa.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                id="input-auth-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <button
            id="btn-auth-submit"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-md shadow-indigo-950/40 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Entrar com Firebase' : 'Cadastrar e Acessar'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 text-center leading-relaxed">
          Autenticação criptograficamente assinada por tokens ID Firebase. Isolamento multi-tenant estrito por Workspace.
        </div>

      </div>
    </div>
  );
};
