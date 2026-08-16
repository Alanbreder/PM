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
  const [mode, setMode] = useState<'login' | 'register' | 'token'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [customToken, setCustomToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(initialError || null);

  const handleFirebaseAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'login') {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCred.user.getIdToken();
        setAuthToken(token);
        onAuthenticated({
          uid: userCred.user.uid,
          email: userCred.user.email || email,
          name: userCred.user.displayName || email.split('@')[0],
        });
      } else if (mode === 'register') {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const token = await userCred.user.getIdToken();
        setAuthToken(token);
        onAuthenticated({
          uid: userCred.user.uid,
          email: userCred.user.email || email,
          name: name || email.split('@')[0],
        });
      }
    } catch (err: any) {
      console.warn('Firebase Auth notice:', err);
      // If Firebase Auth API key is not configured in client, inform user gracefully
      if (err.code === 'auth/api-key-not-valid' || err.message?.includes('API key not valid') || err.code === 'auth/network-request-failed') {
        setErrorMsg('Serviço Firebase Auth não configurado no cliente. Você pode utilizar a aba "Token JWT" para inserir o token de autenticação emitido pelo Firebase.');
        setMode('token');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Email ou senha incorretos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Este email já está cadastrado. Tente fazer login.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setErrorMsg(err.message || 'Erro ao autenticar com Firebase.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCustomTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = customToken.trim();
    if (!token) {
      setErrorMsg('Por favor, informe um token Firebase JWT válido.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      setAuthToken(token);
      onAuthenticated({
        uid: 'user_authenticated',
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
            Autenticação Segura via Firebase Bearer JWT
          </p>
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

        {/* Form: Firebase Login / Register */}
        {(mode === 'login' || mode === 'register') && (
          <form onSubmit={handleFirebaseAuth} className="space-y-4">
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
              <label className="text-xs font-medium text-slate-300">Email corporativo</label>
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
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Entrar no Sistema' : 'Criar Conta e Entrar'}</span>
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
                <span>Firebase Bearer ID Token</span>
                <span className="text-[10px] text-slate-500">JWT</span>
              </label>
              <textarea
                id="input-auth-token"
                rows={4}
                required
                value={customToken}
                onChange={(e) => setCustomToken(e.target.value)}
                placeholder="Cole aqui o Bearer ID Token emitido pelo Firebase..."
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
