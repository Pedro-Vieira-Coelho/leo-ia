import React, { useState } from 'react';
import { authService } from '../services/auth.service';
import {
  ArrowRight,
  ArrowLeft,
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  Shield,
  Check
} from 'lucide-react';
import { FulcroDeMovimento } from '../components/FulcroDeMovimento';
import { LEO_OFFICIAL_AVATAR } from '../shared/constants';

interface RegisterPageProps {
  onNextStep: () => void;
  onBackToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNextStep,
  onBackToLogin
}) => {
  // Dados de Acesso
  const [email, setEmail] = useState('carlos.mendes@email.com');
  const [password, setPassword] = useState('123456');
  const [confirmPassword, setConfirmPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState('(11) 98452-1920');

  // Dados Pessoais & Físicos
  const [name, setName] = useState('Carlos Eduardo Mendes');
  const [age, setAge] = useState(48);
  const [weight, setWeight] = useState(81.5);
  const [height, setHeight] = useState(178);

  // Nível e Rotina
  const [experienceLevel, setExperienceLevel] = useState<'Iniciante' | 'Intermediário' | 'Avançado'>('Intermediário');
  const [trainingDays, setTrainingDays] = useState<string[]>(['Seg', 'Ter', 'Qui', 'Sex']);

  // Erros e Validação
  const [error, setError] = useState('');
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);

  const allDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  const toggleDay = (day: string) => {
    if (trainingDays.includes(day)) {
      if (trainingDays.length > 1) {
        setTrainingDays(trainingDays.filter(d => d !== day));
      }
    } else {
      setTrainingDays([...trainingDays, day]);
    }
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Por favor, informe seu nome completo.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Informe um e-mail válido para acessar sua conta.');
      return;
    }
    if (!password || password.length < 6) {
      setError('A senha deve possuir pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    // Salva os dados no authService e avança para Passo 2 (Preferências)
    authService.register({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      age: Number(age) || 30,
      weightKg: Number(weight) || 75,
      heightCm: Number(height) || 175,
      experienceLevel,
      weeklyFrequency: trainingDays.length || 4,
      trainingDays,
      provider: 'email'
    });

    onNextStep();
  };

  const handleSocialRegister = (provider: 'google' | 'apple') => {
    setSocialLoading(provider);
    setTimeout(() => {
      setSocialLoading(null);
      // Prepara o cadastro social e segue para Passo 2
      authService.register({
        name: name.trim() || 'Aluno LÉO IA',
        email: email.trim() || `aluno.${provider}@leoia.fitness`,
        phone: phone.trim(),
        age: Number(age) || 30,
        weightKg: Number(weight) || 75,
        heightCm: Number(height) || 175,
        experienceLevel,
        weeklyFrequency: trainingDays.length || 4,
        trainingDays,
        provider
      });
      onNextStep();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0B0712] flex flex-col justify-between p-4 sm:p-6 lg:p-10 max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto relative select-none">
      <div className="relative z-10 w-full">
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            onClick={onBackToLogin}
            type="button"
            className="flex items-center gap-1.5 text-xs text-[#A59DB5] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao login</span>
          </button>

          {/* Indicador de Passo */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#B784E6]">
            <span>Passo 1 de 2</span>
            <span className="w-2 h-2 rounded-full bg-[#B784E6]" />
            <span className="w-2 h-2 rounded-full bg-white/20" />
          </div>
        </div>

        {/* LÉO Greeting Badge com Avatar Oficial */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#160E26] border border-[#842BAF]/30 flex items-center gap-3 mb-5 shadow-sm">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#842BAF] bg-[#1F1433] shrink-0">
            <img
              src={LEO_OFFICIAL_AVATAR}
              alt="LÉO IA"
              className="w-full h-full object-cover object-top"
              loading="eager"
            />
          </div>
          <div className="text-xs min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[#B784E6] font-heading font-bold text-xs truncate">
                LÉO IA na recepção
              </span>
              <span className="text-[10px] text-[#2BED77] font-semibold">Conta Pessoal</span>
            </div>
            <p className="text-[#A59DB5] leading-snug mt-0.5 truncate sm:whitespace-normal">
              Prazer em te conhecer! Vamos configurar seus parâmetros para calibrar seus treinos com segurança.
            </p>
          </div>
        </div>

        {/* Título & Descrição */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white">
              Cadastro & Perfil Inicial
            </h2>
            <p className="text-xs text-[#A59DB5] mt-0.5">
              Sua conta é 100% pessoal e independente de qualquer academia.
            </p>
          </div>
          <FulcroDeMovimento size={20} showContainer={true} className="hidden sm:flex" />
        </div>

        {error && (
          <div role="alert" id="register-error-msg" className="p-3 mb-4 rounded-xl bg-red-500/20 border border-red-500/40 text-xs text-red-200 flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Cadastro Social Rápido */}
        <div className="p-3.5 rounded-2xl bg-[#160E26] border border-white/5 mb-4">
          <span className="text-[11px] font-semibold text-[#A59DB5] uppercase tracking-wider block mb-2.5 text-center">
            Ou agilize com sua conta social
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSocialRegister('google')}
              disabled={socialLoading !== null}
              className="py-2 px-3 rounded-xl bg-[#1F1433] hover:bg-[#271044] text-white text-xs font-semibold border border-white/10 flex items-center justify-center gap-2 transition-all min-h-[42px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
              <span>{socialLoading === 'google' ? 'Conectando...' : 'Cadastrar com Google'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialRegister('apple')}
              disabled={socialLoading !== null}
              className="py-2 px-3 rounded-xl bg-[#1F1433] hover:bg-[#271044] text-white text-xs font-semibold border border-white/10 flex items-center justify-center gap-2 transition-all min-h-[42px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6]"
            >
              <svg className="w-3.5 h-3.5 fill-white shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.84.95-2.91-.91.04-2.02.61-2.67 1.37-.58.67-.99 1.77-.85 2.81 1.02.08 2.06-.55 2.57-1.27z" />
              </svg>
              <span>{socialLoading === 'apple' ? 'Conectando...' : 'Cadastrar com Apple'}</span>
            </button>
          </div>
        </div>

        {/* Formulário com Grid Responsivo para Tablets/Desktop */}
        <form onSubmit={handleContinue} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* COLUNA 1: DADOS DE ACESSO & PESSOAIS */}
            <div className="space-y-3.5 p-4 rounded-3xl bg-[#160E26] border border-white/5">
              <h2 className="text-xs font-heading font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Lock className="w-3.5 h-3.5 text-[#B784E6]" />
                <span>Dados de Acesso & Identificação</span>
              </h2>

              {/* Nome */}
              <div>
                <label htmlFor="reg-name-input" className="block text-[11px] font-semibold text-[#A59DB5] mb-1">
                  Nome Completo <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#A59DB5] absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    id="reg-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-describedby={error ? 'register-error-msg' : undefined}
                    placeholder="Seu nome completo"
                    className="w-full bg-[#1F1433] border border-[#311C50] focus:border-[#B784E6] text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] placeholder-[#A59DB5]"
                  />
                </div>
              </div>

              {/* E-mail */}
              <div>
                <label htmlFor="reg-email-input" className="block text-[11px] font-semibold text-[#A59DB5] mb-1">
                  E-mail <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A59DB5] absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    id="reg-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-describedby={error ? 'register-error-msg' : undefined}
                    placeholder="seu.email@exemplo.com"
                    className="w-full bg-[#1F1433] border border-[#311C50] focus:border-[#B784E6] text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] placeholder-[#A59DB5]"
                  />
                </div>
              </div>

              {/* Senha e Confirmar Senha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label htmlFor="reg-password-input" className="block text-[11px] font-semibold text-[#A59DB5] mb-1">
                    Senha <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-describedby={error ? 'register-error-msg' : undefined}
                      placeholder="Mín. 6 dígitos"
                      className="w-full bg-[#1F1433] border border-[#311C50] focus:border-[#B784E6] text-white text-xs rounded-xl pl-3 pr-8 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] placeholder-[#A59DB5]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-[#A59DB5] hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B784E6] rounded p-0.5"
                      title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                      aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-confirm-password-input" className="block text-[11px] font-semibold text-[#A59DB5] mb-1">
                    Confirmar Senha <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="reg-confirm-password-input"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      aria-describedby={error ? 'register-error-msg' : undefined}
                      placeholder="Repita a senha"
                      className="w-full bg-[#1F1433] border border-[#311C50] focus:border-[#B784E6] text-white text-xs rounded-xl pl-3 pr-8 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] placeholder-[#A59DB5]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-2.5 text-[#A59DB5] hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B784E6] rounded p-0.5"
                      title={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Ver confirmação de senha'}
                      aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Ver confirmação de senha'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Celular (Opcional) */}
              <div>
                <label htmlFor="reg-phone-input" className="block text-[11px] font-semibold text-[#A59DB5] mb-1">
                  Celular <span className="text-[10px] text-[#A59DB5] font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#A59DB5] absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    id="reg-phone-input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-[#1F1433] border border-[#311C50] focus:border-[#B784E6] text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] placeholder-[#A59DB5]"
                  />
                </div>
              </div>

              {/* Biometria Rápida */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label htmlFor="reg-age-input" className="block text-[10px] text-[#A59DB5] mb-1 text-center">Idade (anos)</label>
                  <input
                    id="reg-age-input"
                    type="number"
                    required
                    min={14}
                    max={99}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-[#1F1433] border border-[#311C50] text-white text-xs rounded-xl p-2 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="reg-weight-input" className="block text-[10px] text-[#A59DB5] mb-1 text-center">Peso (kg)</label>
                  <input
                    id="reg-weight-input"
                    type="number"
                    step="0.5"
                    required
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full bg-[#1F1433] border border-[#311C50] text-white text-xs rounded-xl p-2 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="reg-height-input" className="block text-[10px] text-[#A59DB5] mb-1 text-center">Altura (cm)</label>
                  <input
                    id="reg-height-input"
                    type="number"
                    required
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full bg-[#1F1433] border border-[#311C50] text-white text-xs rounded-xl p-2 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] font-mono"
                  />
                </div>
              </div>
            </div>

            {/* COLUNA 2: NÍVEL DE EXPERIÊNCIA & DIAS DISPONÍVEIS */}
            <div className="space-y-3.5 p-4 rounded-3xl bg-[#160E26] border border-white/5 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-xs font-heading font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#2BED77]" />
                  <span>Experiência & Disponibilidade</span>
                </h3>

                {/* 3 Cartões de Nível de Experiência com as Descrições Solicitadas */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#A59DB5] mb-1.5">
                    Selecione seu nível de experiência:
                  </label>
                  <div className="space-y-2" role="radiogroup" aria-label="Nível de experiência">
                    {[
                      {
                        level: 'Iniciante' as const,
                        desc: 'Está começando, tem pouca experiência ou está retornando após um longo período parado.'
                      },
                      {
                        level: 'Intermediário' as const,
                        desc: 'Treina regularmente há aproximadamente 6 meses ou mais, conhece os principais exercícios e acompanha sua evolução.'
                      },
                      {
                        level: 'Avançado' as const,
                        desc: 'Possui vários anos de treinamento consistente e familiaridade com progressão de cargas e periodização.'
                      }
                    ].map((item) => {
                      const isSelected = experienceLevel === item.level;
                      return (
                        <button
                          key={item.level}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setExperienceLevel(item.level)}
                          className={`w-full text-left p-3 rounded-2xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] ${
                            isSelected
                              ? 'bg-[#842BAF]/20 border-[#842BAF] shadow-xs'
                              : 'bg-[#1F1433] border-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-heading font-bold text-white">
                              {item.level}
                            </span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-[#2BED77] flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5 text-[#0B0712] stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#A59DB5] leading-snug">
                            {item.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dias disponíveis para treinar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-[#A59DB5]">
                      Dias da Semana Disponíveis
                    </span>
                    <span className="text-[11px] font-semibold text-[#B784E6]">
                      {trainingDays.length} dias
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-1" role="group" aria-label="Dias de treino na semana">
                    {allDays.map((day) => {
                      const selected = trainingDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          aria-pressed={selected}
                          aria-label={`Treinar na ${day}`}
                          onClick={() => toggleDay(day)}
                          className={`h-9 rounded-xl text-xs font-semibold flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B784E6] ${
                            selected
                              ? 'bg-[#842BAF] text-white border border-[#B784E6] shadow-[0_0_8px_rgba(132,43,175,0.4)]'
                              : 'bg-[#1F1433] text-[#A59DB5] border border-white/5 hover:border-white/20'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Botão Avançar */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#842BAF] to-[#681791] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(132,43,175,0.4)] hover:shadow-[0_0_28px_rgba(183,132,230,0.6)] active:scale-95 transition-all"
                >
                  <span>Avançar para Objetivos & Preferências</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Selo de Proteção e Soberania */}
      <div className="relative z-10 py-3 flex items-center justify-center gap-2 text-[11px] text-[#8C849B] text-center mt-3">
        <Shield className="w-3.5 h-3.5 text-[#2BED77] shrink-0" />
        <span>Seus dados pertencem a você. Vínculos com academias são sempre opcionais.</span>
      </div>
    </div>
  );
};
