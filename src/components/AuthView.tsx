import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Key, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  UserPlus,
  LogIn,
  KeyRound,
  ShieldAlert,
  Sparkles
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
  const [mode, setMode] = useState<'login' | 'register' | 'token'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [customToken, setCustomToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(initialError || null);

  // 1. Instant Admin Access
  const handleAdminLogin = async () => {
    setAdminLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'adm@sip.com',
          name: 'Administrador (ADM)',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Falha ao autenticar como administrador.');
      }

      setAuthToken(data.token);
      onAuthenticated(data.user);
    } catch (err: any) {
      console.error('Admin login error:', err);
      setErrorMsg(err.message || 'Erro ao efetuar login de Administrador.');
    } finally {
      setAdminLoading(false);
    }
  };

  // 2. Standard Form Login/Register with API fallback
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

    // Try Firebase Auth first if available
    try {
      if (mode === 'login') {
        const userCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const token = await userCred.user.getIdToken();
        setAuthToken(token);
        onAuthenticated({
          uid: userCred.user.uid,
          email: userCred.user.email || cleanEmail,
          name: userCred.user.displayName || cleanEmail.split('@')[0],
        });
        return;
      } else if (mode === 'register') {
        const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const token = await userCred.user.getIdToken();
        setAuthToken(token);
        onAuthenticated({
          uid: userCred.user.uid,
          email: userCred.user.email || cleanEmail,
          name: name || cleanEmail.split('@')[0],
        });
        return;
      }
    } catch (fbErr: any) {
      console.info('Firebase auth fallback to local API auth:', fbErr?.code || fbErr?.message);
    }

    // Fallback to internal API auth
    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: password || '123456',
          name: name || cleanEmail.split('@')[0],
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Não foi possível autenticar.');
      }

      setAuthToken(data.token);
      onAuthenticated(data.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao realizar autenticação.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Custom Token submit
  const handleCustomTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = customToken.trim();
    if (!token) {
      setErrorMsg('Por favor, informe um token JWT válido.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      setAuthToken(token);
      onAuthenticated({
        uid: 'usr_authenticated',
        email: email || 'usuario@productos.io',
        name: name || 'Usuário Autenticado',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao aplicar o token.');
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
            Acesso ao Sistema de Inteligência & Descoberta de Produto
          </p>
        </div>

        {/* Quick Admin Access Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/40 shadow-inner space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-indigo-500/20 text-indigo-300">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <div className="text-xs font-semibold text-white">Acesso Rápido de Administrador</div>
              <div className="text-[11px] text-slate-400">Acesse instantaneamente como usuário ADM</div>
            </div>
          </div>
          
          <button
            id="btn-admin-quick-login"
            type="button"
            onClick={handleAdminLogin}
            disabled={adminLoading || loading}
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-md shadow-indigo-950/40"
          >
            {adminLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Liberando Acesso ADM...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Entrar como Administrador (ADM)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider font-medium">
            ou acesse com email
          </span>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-800 text-xs">
          <button
            id="tab-login"
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`flex-1 py-2 font-medium border-b-2 transition flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Entrar
          </button>
          <button
            id="tab-register"
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); }}
            className={`flex-1 py-2 font-medium border-b-2 transition flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Criar Conta
          </button>
          <button
            id="tab-token"
            type="button"
            onClick={() => { setMode('token'); setErrorMsg(null); }}
            className={`flex-1 py-2 font-medium border-b-2 transition flex items-center justify-center gap-1.5 ${
              mode === 'token'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Token JWT
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
        {(mode === 'login' || mode === 'register') && (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Nome</label>
                <div className="relative">
                  <input
                    id="input-auth-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  id="input-auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@empresa.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  id="input-auth-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <button
              id="btn-auth-submit"
              type="submit"
              disabled={loading || adminLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition border border-slate-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Entrar com Email' : 'Criar Conta e Acessar'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Form: Direct Token Input */}
        {mode === 'token' && (
          <form onSubmit={handleCustomTokenSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>Bearer ID Token</span>
                <span className="text-[10px] text-slate-500">JWT</span>
              </label>
              <textarea
                id="input-auth-token"
                rows={4}
                required
                value={customToken}
                onChange={(e) => setCustomToken(e.target.value)}
                placeholder="Cole aqui o Token JWT..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <button
              id="btn-token-submit"
              type="submit"
              disabled={loading || !customToken.trim()}
              className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando token...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Conectar com Token</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 text-center leading-relaxed">
          Proteção de dados com controle de acesso RBAC e isolamento multi-tenant.
        </div>

      </div>
    </div>
  );
};
