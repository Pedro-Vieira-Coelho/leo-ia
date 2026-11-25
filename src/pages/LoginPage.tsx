import React, { useState } from 'react';
import { authService } from '../services/auth.service';
import {
  ArrowRight,
  Lock,
  Mail,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  CreditCard
} from 'lucide-react';
import { FulcroDeMovimento } from '../components/FulcroDeMovimento';
import { LEO_OFFICIAL_AVATAR } from '../shared/constants';
import { useAccessibleModal } from '../shared/useAccessibleModal';

function getLoginErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('email not confirmed')) {
    return 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada e a pasta de spam para confirmar sua conta.';
  }
  if (normalizedMessage.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos, ou a conta ainda não foi confirmada. Verifique os dados e tente novamente.';
  }
  if (
    normalizedMessage.includes('profiles') ||
    normalizedMessage.includes('schema cache') ||
    normalizedMessage.includes('row-level security') ||
    normalizedMessage.includes('permission denied')
  ) {
    return `O login foi iniciado, mas houve um erro ao carregar o perfil do banco: ${message}`;
  }
  if (normalizedMessage.includes('failed to fetch') || normalizedMessage.includes('network')) {
    return 'Não foi possível conectar ao Supabase. Confira a conexão e as variáveis do .env.local.';
  }

  return message ? `Falha no login: ${message}` : 'Não foi possível entrar. Tente novamente.';
}

interface LoginPageProps {
  onLoginSuccess: () => void;
  onNavigateToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateToRegister
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [showMatriculaLogin, setShowMatriculaLogin] = useState(false);
  const [matricula, setMatricula] = useState('');
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);

  const { modalRef: forgotModalRef } = useAccessibleModal({
    isOpen: forgotPasswordOpen,
    onClose: () => setForgotPasswordOpen(false)
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Por favor, preencha seu e-mail e senha.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await authService.login(email.trim(), password);
      onLoginSuccess();
    } catch (error) {
      setError(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMatriculaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricula.trim() || !password.trim()) {
      setError('Informe o número da sua matrícula e senha.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await authService.login(`aluno.${matricula.trim()}@academia.com`, password);
      onLoginSuccess();
    } catch {
      setError('Não foi possível entrar com essa matrícula. Confira os dados e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setSocialLoading(provider);
    setError('');
    try {
      await authService.loginWithProvider(provider);
    } catch {
      setSocialLoading(null);
      setError(`Não foi possível conectar com ${provider === 'google' ? 'Google' : 'Apple'}. Verifique se o provedor está habilitado no Supabase.`);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotError('');
    setIsSendingReset(true);
    try {
      await authService.resetPassword(forgotEmail.trim());
      setForgotSuccess(true);
    } catch {
      setForgotError('Não foi possível enviar o link. Confira a configuração de e-mail do Supabase e tente novamente.');
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0712] flex flex-col justify-between p-4 sm:p-6 lg:p-10 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#271044]/60 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-[#842BAF]/20 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="relative z-10 w-full pt-3 sm:pt-6">
        {/* 1. LÉO IA Identity Branding Compacto e Oficial */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            {/* Símbolo Oficial: Fulcro de Movimento (3 traços diagonais: roxo, lilás, verde) */}
            <FulcroDeMovimento size={24} showContainer={true} />

            {/* Nome LÉO IA */}
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-wide text-white flex items-center gap-1.5">
              LÉO <span className="text-[#B784E6]">IA</span>
            </h1>

            {/* Avatar Oficial do Personagem LÉO IA (compacto) */}
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-[#842BAF] bg-[#1F1433] shadow-[0_0_12px_rgba(132,43,175,0.4)] ml-1 shrink-0">
              <img
                src={LEO_OFFICIAL_AVATAR}
                alt="LÉO IA Persona"
                className="w-full h-full object-cover object-top"
                loading="eager"
              />
              <span
                className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#2BED77] border-2 border-[#160E26]"
                title="LÉO Ativo"
              />
            </div>
          </div>

          {/* Slogan Oficial */}
          <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.16em] uppercase text-[#B784E6] font-heading">
            EXPERIÊNCIA QUE ORIENTA
          </span>
        </div>

        {/* 2. Login Card */}
        <div className="glass-card-elevated rounded-3xl p-5 sm:p-7 md:p-8 backdrop-blur-xl border border-white/10 shadow-2xl max-w-md mx-auto">
          {/* Título & Descrição Atualizados */}
          <h2 className="text-lg sm:text-xl font-heading font-bold text-white mb-1">
            Acesse sua conta LÉO IA
          </h2>
          <p className="text-xs text-[#A59DB5] mb-5 leading-relaxed">
            Entre para continuar acompanhando seus treinos e sua evolução.
          </p>

          {error && (
            <div role="alert" id="login-error-alert" className="p-3 mb-4 rounded-xl bg-red-500/20 border border-red-500/40 text-xs text-red-200 animate-fadeIn">
              {error}
            </div>
          )}

          {!showMatriculaLogin ? (
            /* Formulário Principal: E-mail e Senha */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label htmlFor="login-email-input" className="block text-xs font-semibold text-[#A59DB5] mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A59DB5] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    id="login-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-describedby={error ? 'login-error-alert' : undefined}
                    placeholder="seu.email@exemplo.com"
                    className="w-full bg-[#171026] border border-[#311C50] focus:border-[#B784E6] text-white text-xs sm:text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] placeholder-[#A59DB5] transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password-input" className="block text-xs font-semibold text-[#A59DB5]">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-xs text-[#B784E6] hover:text-white transition-colors focus-visible:outline-none focus-visible:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A59DB5] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-describedby={error ? 'login-error-alert' : undefined}
                    placeholder="••••••••"
                    className="w-full bg-[#171026] border border-[#311C50] focus:border-[#B784E6] text-white text-xs sm:text-sm rounded-xl pl-10 pr-10 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] placeholder-[#A59DB5] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-[#A59DB5] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] rounded-md p-0.5"
                    title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                    aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#842BAF] to-[#681791] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(132,43,175,0.4)] hover:shadow-[0_0_28px_rgba(183,132,230,0.6)] active:scale-95 transition-all mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] disabled:opacity-60"
              >
                <span>{isSubmitting ? 'Entrando...' : 'Entrar'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Alternativa Secundária: Matrícula da Academia */
            <form onSubmit={handleMatriculaSubmit} className="space-y-3.5">
              <div>
                <label htmlFor="login-matricula-input" className="block text-xs font-semibold text-[#A59DB5] mb-1.5">
                  Matrícula da Academia
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-[#A59DB5] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    id="login-matricula-input"
                    type="text"
                    required
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    aria-describedby={error ? 'login-error-alert' : undefined}
                    placeholder="Ex: 84920"
                    className="w-full bg-[#171026] border border-[#311C50] focus:border-[#B784E6] text-white text-xs sm:text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] placeholder-[#A59DB5] transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-matricula-password" className="block text-xs font-semibold text-[#A59DB5] mb-1.5">
                  Senha da Academia
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A59DB5] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    id="login-matricula-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-describedby={error ? 'login-error-alert' : undefined}
                    placeholder="••••••••"
                    className="w-full bg-[#171026] border border-[#311C50] focus:border-[#B784E6] text-white text-xs sm:text-sm rounded-xl pl-10 pr-10 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] placeholder-[#A59DB5] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-[#A59DB5] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] rounded-md p-0.5"
                    title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                    aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#842BAF] to-[#681791] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(132,43,175,0.4)] active:scale-95 transition-all mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] disabled:opacity-60"
              >
                <span>Acessar com Matrícula</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowMatriculaLogin(false)}
                  className="text-xs text-[#B784E6] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B784E6] rounded"
                >
                  Voltar para login com e-mail pessoal
                </button>
              </div>
            </form>
          )}

          {/* 3. Divisão Visual: "Ou continue com" */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#160E26] px-3 text-[11px] font-medium text-[#8C849B] shrink-0 uppercase tracking-wider">
              Ou continue com
            </span>
            <div className="border-t border-white/10 w-full" />
          </div>

          {/* 4. Botões Oficiais Google e Apple */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Continuar com Google */}
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={socialLoading !== null}
              className="py-2.5 px-3 rounded-xl bg-[#171026] hover:bg-[#1F1433] text-white text-xs font-semibold border border-white/10 hover:border-white/20 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm min-h-[44px]"
            >
              {/* Google Official G Symbol SVG */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{socialLoading === 'google' ? 'Conectando...' : 'Google'}</span>
            </button>

            {/* Continuar com Apple */}
            <button
              type="button"
              onClick={() => handleSocialLogin('apple')}
              disabled={socialLoading !== null}
              className="py-2.5 px-3 rounded-xl bg-[#171026] hover:bg-[#1F1433] text-white text-xs font-semibold border border-white/10 hover:border-white/20 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm min-h-[44px]"
            >
              {/* Apple Official Logo SVG */}
              <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.84.95-2.91-.91.04-2.02.61-2.67 1.37-.58.67-.99 1.77-.85 2.81 1.02.08 2.06-.55 2.57-1.27z" />
              </svg>
              <span>{socialLoading === 'apple' ? 'Conectando...' : 'Apple'}</span>
            </button>
          </div>

          {/* Alternativa secundária: Matrícula da academia */}
          {!showMatriculaLogin && (
            <div className="text-center mt-3 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowMatriculaLogin(true)}
                className="text-[11px] text-[#A59DB5] hover:text-[#B784E6] transition-colors"
              >
                Possui matrícula da academia? <span className="underline">Acessar por matrícula</span>
              </button>
            </div>
          )}

        </div>

        {/* 5. Link Criar Conta */}
        <div className="text-center mt-5 mb-4">
          <p className="text-xs text-[#A59DB5]">
            Ainda não tem uma conta?{' '}
            <button
              onClick={onNavigateToRegister}
              className="text-[#B784E6] font-bold hover:underline ml-0.5"
              type="button"
            >
              Criar conta
            </button>
          </p>
        </div>
      </div>

      {/* 6. Selo de Segurança e Orientação */}
      <div className="relative z-10 py-3 flex items-center justify-center gap-2 text-[11px] text-[#8C849B] text-center">
        <Shield className="w-3.5 h-3.5 text-[#2BED77] shrink-0" />
        <span>Sua conta e histórico são seus. Conexão supervisionada com o CREF.</span>
      </div>

      {/* 7. Modal de Recuperação de Senha */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            ref={forgotModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-password-title"
            tabIndex={-1}
            className="w-full max-w-sm rounded-3xl bg-[#1F1433] border border-[#842BAF]/40 p-5 shadow-2xl relative text-center focus:outline-none"
          >
            <button
              type="button"
              onClick={() => setForgotPasswordOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#8C849B] hover:text-white bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
              aria-label="Fechar recuperação de senha"
            >
              <X className="w-4 h-4" />
            </button>

            {forgotSuccess ? (
              <div className="py-4 space-y-2.5">
                <div className="w-12 h-12 rounded-full bg-[#2BED77]/20 border border-[#2BED77]/40 flex items-center justify-center text-[#2BED77] mx-auto shadow-[0_0_12px_rgba(43,237,119,0.3)]">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h2 id="forgot-password-title" className="text-sm font-heading font-bold text-white">
                  Solicitação Enviada
                </h2>
                <p className="text-xs text-[#A59DB5] leading-relaxed max-w-xs mx-auto">
                  Se o e-mail informado estiver cadastrado, você receberá um link seguro para redefinir sua senha em instantes.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3.5 pt-1">
                <div className="w-10 h-10 rounded-2xl bg-[#842BAF]/20 border border-[#842BAF]/40 flex items-center justify-center text-[#B784E6] mx-auto mb-1">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 id="forgot-password-title" className="text-sm font-heading font-bold text-white">
                  Recuperar sua senha
                </h2>
                <p className="text-xs text-[#A59DB5] leading-relaxed">
                  Digite seu e-mail cadastrado para receber as instruções de recuperação.
                </p>

                <div className="text-left">
                  <label htmlFor="forgot-email-input" className="block text-xs font-semibold text-[#A59DB5] mb-1">
                    E-mail cadastrado
                  </label>
                  <input
                    id="forgot-email-input"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full bg-[#171026] border border-[#311C50] text-white text-xs rounded-xl p-3 focus:outline-none focus:border-[#B784E6] focus-visible:ring-2 focus-visible:ring-[#B784E6] placeholder-[#A59DB5]"
                  />
                </div>
                {forgotError && <p role="alert" className="text-left text-xs text-red-300">{forgotError}</p>}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-[#171026] text-xs font-semibold text-[#A59DB5] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingReset}
                    className="flex-1 py-2.5 rounded-xl bg-[#842BAF] text-xs font-semibold text-white hover:bg-[#681791] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
                  >
                    {isSendingReset ? 'Enviando...' : 'Enviar Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
