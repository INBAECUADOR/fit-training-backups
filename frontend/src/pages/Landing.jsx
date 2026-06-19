import React from 'react'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import { Dumbbell, UtensilsCrossed, TrendingUp, Camera, ClipboardList, Trophy, ChevronRight, Sparkles, Check, ChartNoAxesCombined, Smartphone, Shield } from 'lucide-react'

const FEATURES = [
  { icon: Dumbbell, title: 'Rutinas Personalizadas', desc: 'Planes de entrenamiento adaptados a tu objetivo, nivel y días disponibles.' },
  { icon: ClipboardList, title: 'Plan Completo', desc: 'Rutinas y dietas generadas automáticamente según tu objetivo y nivel.' },
  { icon: UtensilsCrossed, title: 'Dieta Inteligente', desc: 'Plan alimenticio con macronutrientes calculados según tu meta.' },
  { icon: Camera, title: 'Fotos de Progreso', desc: 'Registra tu evolución visual con fotos frontal, espalda y lateral.' },
  { icon: TrendingUp, title: 'Métricas Detalladas', desc: 'Seguimiento de peso, medidas corporales y composición. +15 medidas.' },
  { icon: Trophy, title: 'Records Personales', desc: 'Tracking de tus marcas en cada ejercicio con progresión.' },
]

const STEPS = [
  { num: '01', title: 'Configuración Inicial', desc: 'El entrenador configura tu perfil con tu objetivo, experiencia y equipo disponible.' },
  { num: '02', title: 'Plan Personalizado', desc: 'Se genera tu rutina y dieta exacta para ti. Revisa y ajusta según prefieras.' },
  { num: '03', title: 'Seguimiento Semanal', desc: 'Registra tus pesos, medidas y fotos. La app muestra tu evolución en gráficos.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const handleCta = () => {
    if (token) navigate('/')
    else navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gym-900">
      <SEO path="/" />

      {/* Navbar */}
      <nav className="border-b border-gym-700/30 sticky top-0 bg-gym-900/90 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://enriquezmania.com/wp-content/uploads/2024/08/logo.png" alt="EnriquezMania" className="h-8 w-auto" />
            <span className="text-lg font-extrabold text-white hidden sm:inline">EnriquezMania</span>
          </div>
          <div className="flex items-center gap-3">
            {token ? (
              <button onClick={() => navigate('/')} className="px-5 py-2 bg-gradient-to-r from-gym-400 to-orange-500 text-white font-bold rounded-xl text-sm transition hover:opacity-90">
                Ir al Dashboard
              </button>
            ) : (
              <button onClick={() => navigate('/login')} className="px-5 py-2 bg-gradient-to-r from-gym-400 to-orange-500 text-white font-bold rounded-xl text-sm transition hover:opacity-90">
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gym-400/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 pt-20 pb-24 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gym-400/10 border border-gym-400/20 rounded-full text-gym-300 text-xs font-bold mb-8">
            <Sparkles size={14} /> Plataforma creada por el Ing. Jose Luis Enriquez
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            Tu Entrenamiento{' '}
            <span className="bg-gradient-to-r from-gym-200 via-gym-300 to-orange-400 bg-clip-text text-transparent">
              Personalizado
            </span>
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Genera rutinas, planes de alimentación y haz seguimiento de tu evolución con fotos y métricas.
            Todo en una sola plataforma.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={handleCta}
              className="px-8 py-3.5 bg-gradient-to-r from-gym-400 to-orange-500 text-white font-bold rounded-xl text-lg transition hover:opacity-90 shadow-lg shadow-gym-400/30 flex items-center gap-2">
              {token ? 'Ir a mi Dashboard' : 'Comenzar ahora'}
              <ChevronRight size={20} />
            </button>
            <a href="#features" className="px-8 py-3.5 bg-gym-800 border border-gym-700 text-gray-300 font-bold rounded-xl text-lg transition hover:bg-gym-700">
              Ver funciones
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Todo lo que necesitás en un solo lugar</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Una plataforma completa para entrenadores y sus clientes.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-gym-800/50 border border-gym-700/30 rounded-2xl p-6 hover:border-gym-400/30 transition group">
                <div className="w-12 h-12 bg-gym-400/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gym-400/20 transition">
                  <f.icon size={24} className="text-gym-300" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gym-800/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">¿Cómo funciona?</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Tres pasos simples para transformar tu entrenamiento.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gym-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-gym-400/30">
                  <span className="text-2xl font-extrabold text-white">{s.num}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features detail */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
                Control total de tu{' '}
                <span className="bg-gradient-to-r from-gym-200 to-gym-300 bg-clip-text text-transparent">evolución</span>
              </h2>
              <ul className="space-y-4">
                {[
                  'Más de 15 medidas corporales: peso, brazos, piernas, abdomen y más',
                  'Fotos de progreso: frontal, espalda, lateral y pose',
                  'Gráficos interactivos para ver tu tendencia',
                  'Comparativa automática entre mediciones',
                  'Exportación de datos a CSV',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gym-800/50 border border-gym-700/30 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <ChartNoAxesCombined size={24} className="text-gym-300" />
                <h3 className="text-lg font-bold text-white">Métricas destacadas</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Peso', value: '75.2 kg', color: 'from-gym-400 to-red-500' },
                  { label: 'Hombros', value: '112 cm', color: 'from-gym-300 to-amber-500' },
                  { label: 'Pecho', value: '98 cm', color: 'from-gym-200 to-emerald-400' },
                  { label: 'Bíceps', value: '36 cm', color: 'from-blue-500 to-cyan-400' },
                ].map((s, i) => (
                  <div key={i} className={`bg-gradient-to-br ${s.color} rounded-xl p-4 text-center`}>
                    <p className="text-xs text-white/80">{s.label}</p>
                    <p className="text-xl font-extrabold text-white">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Plans */}
      <section className="py-20 bg-gym-800/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Planes</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Elegí el plan que mejor se adapte a tus necesidades.</p>
          </div>
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-br from-gym-400/10 to-orange-500/10 border border-gym-400/30 rounded-2xl p-8 relative">
              <span className="absolute -top-3 right-6 px-3 py-1 bg-gradient-to-r from-gym-400 to-orange-500 text-white text-xs font-bold rounded-full">
                Recomendado
              </span>
              <h3 className="text-xl font-bold text-white mb-4">Premium</h3>
              <div className="space-y-4 mb-8">
                <div className="bg-gym-800/50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-white">Mensual</p>
                    <p className="text-sm text-gray-400">Facturado cada mes</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-white">$30</span>
                    <span className="text-sm text-gray-500">/mes</span>
                  </div>
                </div>
                <div className="bg-gym-800/50 rounded-xl p-4 flex items-center justify-between border border-gym-400/20">
                  <div>
                    <p className="text-lg font-bold text-white">Anual</p>
                    <p className="text-sm text-gray-400">Facturado una vez al año</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-white">$19.99</span>
                    <span className="text-sm text-gray-500">/mes</span>
                    <br />
                    <span className="text-xs text-emerald-400 font-bold">$239.88 al año</span>
                  </div>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {['Rutina personalizada', 'Dieta personalizada', 'Fotos de progreso', 'Dashboard multi-usuario', 'Soporte prioritario'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check size={16} className="text-emerald-400 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <button onClick={handleCta}
                className="w-full py-3 bg-gradient-to-r from-gym-400 to-orange-500 text-white font-bold rounded-xl text-sm transition hover:opacity-90 shadow-lg shadow-gym-400/30">
                Elegir Plan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile / Cross-platform */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gym-800/50 border border-gym-700/30 rounded-2xl p-8 order-2 lg:order-1">
              <div className="flex items-center gap-3 mb-6">
                <Smartphone size={24} className="text-gym-300" />
                <h3 className="text-lg font-bold text-white">Accede desde cualquier lugar</h3>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gym-700 border-2 border-gym-800 flex items-center justify-center text-xs text-white font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-gray-400 text-sm">+30 usuarios activos</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Diseñada para funcionar en cualquier dispositivo con acceso a internet.
                Sin instalaciones, sin complicaciones.
              </p>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
                Lista en{' '}
                <span className="bg-gradient-to-r from-gym-200 to-orange-400 bg-clip-text text-transparent">minutos</span>
              </h2>
              <ul className="space-y-4">
                {[
                  'Sin descargas ni instalaciones',
                  'Acceso desde celular, tablet o PC',
                  'Datos guardados automáticamente',
                  'Diseño responsive y rápido',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Shield size={18} className="text-gym-300 shrink-0 mt-0.5" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-gym-400/10 to-orange-500/10 border border-gym-400/20 rounded-3xl p-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              ¿Sos entrenador personal?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Ten tu propia plataforma para gestionar todos tus clientes. Rutinas, dietas, evolución con fotos y más.
            </p>
            <button onClick={handleCta}
              className="px-8 py-3.5 bg-gradient-to-r from-gym-400 to-orange-500 text-white font-bold rounded-xl text-lg transition hover:opacity-90 shadow-lg shadow-gym-400/30 inline-flex items-center gap-2">
              {token ? 'Ir al Dashboard' : 'Contactar ahora'}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gym-700/30">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="https://enriquezmania.com/wp-content/uploads/2024/08/logo.png" alt="EnriquezMania" className="h-8 w-auto" />
              <span className="text-sm font-bold text-white">EnriquezMania</span>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Plataforma creada por el <span className="text-gray-300 font-semibold">Ing. Jose Luis Enriquez</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
