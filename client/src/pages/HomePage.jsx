import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const SPLASH_CHAMPIONS = ['darius', 'ahri', 'yasuo', 'lux', 'thresh', 'leona', 'ashe', 'jinx'];

export default function HomePage() {
  const navigate = useNavigate();
  const { user, login, register, loading, error, clearError } = useAuthStore();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [bgChamp] = useState(() => SPLASH_CHAMPIONS[Math.floor(Math.random() * SPLASH_CHAMPIONS.length)]);
  const [splashLoaded, setSplashLoaded] = useState(false);

  useEffect(() => {
    if (user) navigate('/lobby');
  }, [user]);

  useEffect(() => { clearError(); }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let success;
    if (mode === 'login') {
      success = await login(form.email, form.password);
    } else {
      success = await register(form.username, form.email, form.password);
    }
    if (success) navigate('/lobby');
  };

  const splashUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${
    bgChamp.charAt(0).toUpperCase() + bgChamp.slice(1)
  }_0.png`;

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-void">
      {/* Background splash art */}
      <div className="absolute inset-0 z-0">
        <img
          src={splashUrl}
          alt=""
          onLoad={() => setSplashLoaded(true)}
          className={`w-full h-full object-cover object-top transition-opacity duration-1000 ${splashLoaded ? 'opacity-25' : 'opacity-0'}`}
          style={{ filter: 'blur(1px)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-void via-void/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-void/60" />
      </div>

      {/* Stars / particle background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gold-300 opacity-20"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 3 + 's',
              animation: `pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center px-8 md:px-20 py-12 w-full max-w-lg page-enter">
        {/* Logo / title */}
        <div className="mb-12">
          <div className="text-gold-400 text-xs font-mono tracking-[0.4em] uppercase mb-3 opacity-70">
            ⚔ &nbsp;Runeterra Chronicles&nbsp; ⚔
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-gold-300 leading-tight mb-4"
              style={{ textShadow: '0 0 40px rgba(212,175,55,0.5)' }}>
            Forge Your<br />Legend
          </h1>
          <p className="font-body text-lg text-amber-100/60 leading-relaxed max-w-sm">
            Choose your champion. Navigate the realms of Runeterra. 
            Every decision shapes the story — the AI-powered narrator never tells the same tale twice.
          </p>
        </div>

        {/* Auth card */}
        <div
          className="border border-gold-500/30 rounded-lg p-6 backdrop-blur-sm"
          style={{ background: 'rgba(13, 13, 31, 0.85)' }}
        >
          {/* Tab switcher */}
          <div className="flex mb-6 border border-border rounded-md overflow-hidden">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 text-sm font-heading tracking-widest uppercase transition-all ${
                  mode === m
                    ? 'bg-gold-500/20 text-gold-300 border-b-2 border-gold-400'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Join'}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500/40 rounded text-red-300 text-sm font-body">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-mono tracking-widest text-gold-400/70 uppercase mb-1.5">
                  Summoner Name
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  placeholder="Enter your name..."
                  required
                  className="w-full bg-surface border border-border rounded px-4 py-2.5 text-sm font-body text-amber-100 placeholder-gray-600
                             focus:outline-none focus:border-gold-400/60 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-mono tracking-widest text-gold-400/70 uppercase mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="your@email.com"
                required
                className="w-full bg-surface border border-border rounded px-4 py-2.5 text-sm font-body text-amber-100 placeholder-gray-600
                           focus:outline-none focus:border-gold-400/60 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono tracking-widest text-gold-400/70 uppercase mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                required
                className="w-full bg-surface border border-border rounded px-4 py-2.5 text-sm font-body text-amber-100 placeholder-gray-600
                           focus:outline-none focus:border-gold-400/60 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 font-heading tracking-[0.2em] uppercase text-sm
                         bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400
                         text-void font-bold rounded transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         active:scale-95"
              style={{ boxShadow: loading ? 'none' : '0 0 20px rgba(212,175,55,0.3)' }}
            >
              {loading ? 'Entering the Rift...' : (mode === 'login' ? 'Enter the Rift' : 'Begin Your Legend')}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-600 font-mono">
          Runeterra Chronicles is a fan-made RPG • Not affiliated with Riot Games
        </p>
      </div>
    </div>
  );
}
