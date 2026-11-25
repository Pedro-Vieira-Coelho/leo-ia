import React, { useState } from 'react';
import { authService } from '../services/auth.service';

interface PasswordRecoveryPageProps {
  onComplete: () => void;
  onBackToLogin: () => void;
}

export const PasswordRecoveryPage: React.FC<PasswordRecoveryPageProps> = ({
  onComplete,
  onBackToLogin,
}) => {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!authService.isAuthenticated()) {
      setError('Este link expirou ou é inválido. Solicite uma nova recuperação de senha.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmation) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.updatePassword(password);
      window.history.replaceState({}, '', window.location.pathname);
      onComplete();
    } catch {
      setError('Não foi possível atualizar a senha. Solicite um novo link e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0712] flex items-center justify-center p-5 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-3xl bg-[#160E26] border border-white/10 p-6">
        <div>
          <h1 className="text-xl font-heading font-bold">Criar nova senha</h1>
          <p className="mt-2 text-sm text-[#A59DB5]">Escolha uma senha com pelo menos 6 caracteres.</p>
        </div>
        {!authService.isAuthenticated() && (
          <p role="status" className="text-sm text-amber-200">
            Abra esta página pelo link de recuperação enviado ao seu e-mail.
          </p>
        )}
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <label className="block text-sm text-[#A59DB5]">
          Nova senha
          <input
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-xl bg-[#0B0712] border border-[#311C50] p-3 text-white"
          />
        </label>
        <label className="block text-sm text-[#A59DB5]">
          Confirmar senha
          <input
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className="mt-1 w-full rounded-xl bg-[#0B0712] border border-[#311C50] p-3 text-white"
          />
        </label>
        <button
          type="submit"
          disabled={isSubmitting || !authService.isAuthenticated()}
          className="w-full rounded-xl bg-[#842BAF] p-3 font-semibold disabled:opacity-50"
        >
          {isSubmitting ? 'Salvando...' : 'Atualizar senha'}
        </button>
        <button type="button" onClick={onBackToLogin} className="w-full text-sm text-[#B784E6]">
          Voltar ao login
        </button>
      </form>
    </div>
  );
};
