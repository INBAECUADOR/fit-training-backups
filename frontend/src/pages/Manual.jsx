import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import {
  BookOpen, LayoutDashboard, Dumbbell, UtensilsCrossed, TrendingUp, Trophy,
  Calculator, Clock, Image, RefreshCw, Target, User, Calendar, Activity,
  FileText, Zap, ChevronRight, Search, Clipboard, Shield
} from 'lucide-react'

const sections = [
  {
    id: 'inicio', icon: LayoutDashboard,
    title: 'Panel Principal (Inicio)',
    items: [
      [User, 'Avatar y nombre en la parte superior. Haz clic en la cámara para subir una foto de perfil.'],
      [Target, 'Membresía: plan, fechas y días restantes. La barra muestra el progreso de tu membresía.'],
      [FileText, 'Frase Motivacional: cambia cada día, administrada por el entrenador.'],
      [Dumbbell, 'Rutina de Hoy: en días de entreno (lun–vie) ves cuántos ejercicios tienes. Findes muestra "Día de descanso".'],
      [Activity, 'Peso Rápido: ingresa tu peso del día y se guarda al instante.'],
      [Trophy, 'Estadísticas: racha de días consecutivos, total de entrenos, records personales, series totales.'],
      [TrendingUp, 'Composición Corporal: estima tu % de grasa (método Navy), masa magra y masa grasa.'],
      [TrendingUp, 'Mini Gráficas: evolución de peso, pecho, cintura y brazos.'],
      [Calendar, 'Calendario 30 días: cuadrícula de los últimos 30 días; verde = entrenaste, oscuro = descanso.'],
      [Activity, 'Recuperación Muscular: grupos musculares trabajados en los últimos 7 días.'],
      [FileText, 'Resultados Recientes: últimos 5 registros con peso, reps y fecha.'],
    ],
  },
  {
    id: 'rutina', icon: Dumbbell,
    title: 'Rutina de Entrenamiento',
    items: [
      [Calendar, 'Pestañas de días (Lun–Vie). Cambia de día para ver tus ejercicios.'],
      [Image, 'Cada ejercicio muestra un GIF demostrativo. Haz clic en el GIF para verlo en pantalla completa.'],
      [Clock, 'Series, reps y tiempo de descanso se muestran en cada tarjeta.'],
      [RefreshCw, 'Alternativas: haz clic en "Ver alternativas" para ver otros ejercicios del mismo grupo muscular. Haz clic en una alternativa para ver su GIF.'],
      [Clipboard, 'Registrar Resultado: anota peso, reps, tiempo y observación. Ves el resultado anterior y una sugerencia AI (si completaste todas las reps, sugiere aumentar 2.5–5kg).'],
      [TrendingUp, 'Ver Progreso: gráfica histórica de peso y reps para ese ejercicio.'],
      [Clock, 'Temporizador de Descanso: al guardar un resultado se inicia el descanso. Botones 30s, 1:00, 1:30, 2:00, 3:00.'],
    ],
  },
  {
    id: 'dieta', icon: UtensilsCrossed,
    title: 'Plan de Dieta',
    items: [
      [Calendar, '7 pestañas (lun–dom). Cada día tiene 5 comidas: Desayuno, Media Mañana, Almuerzo, Media Tarde, Cena.'],
      [FileText, 'Edita cada comida escribiendo directamente en los campos de texto.'],
      [Zap, 'Guarda los cambios con el botón "Guardar Dieta".'],
    ],
  },
  {
    id: 'evolucion', icon: TrendingUp,
    title: 'Evolución y Medidas',
    items: [
      [User, 'Registra medidas: peso, pecho, cintura, brazos, piernas, hombros, espalda, bíceps, antebrazos, muñeca, abdomen, cadera, muslo, pantorrilla, cuello y más.'],
      [Image, 'Toma hasta 4 fotos de progreso (frontal, espalda, lateral, pose). Haz clic para verlas en grande.'],
      [Calendar, 'Selector de fecha. Botones rápidos: Hoy, Ayer, 7 días, 15 días, 30 días, Inicio de mes.'],
      [TrendingUp, 'Gráfica de evolución: peso, pecho y cintura en el tiempo.'],
      [RefreshCw, 'Comparación lado a lado con la medición anterior, mostrando diferencias.'],
      [FileText, 'Exportar a CSV: descarga tus medidas en formato de hoja de cálculo.'],
    ],
  },
  {
    id: 'records', icon: Trophy,
    title: 'Records Personales (PRs)',
    items: [
      [Trophy, 'Lista de todos tus ejercicios con: mejor peso, mejores reps y 1RM estimado (fórmula de Epley).'],
      [Search, 'Busca y filtra ejercicios por nombre.'],
      [TrendingUp, 'Ordena por peso, reps o 1RM para ver tus marcas más importantes.'],
      [FileText, 'Exportar a CSV para llevar un registro externo.'],
    ],
  },
  {
    id: 'calorias', icon: Calculator,
    title: 'Calculadora de Calorías',
    items: [
      [Search, 'Modo Manual: busca entre 300+ alimentos (español e inglés). Selecciona, ingresa los gramos y suma al total del día.'],
      [Image, 'Modo Foto: toma o sube una imagen de tu comida. La IA identifica los alimentos y estima las calorías.'],
      [UtensilsCrossed, 'Elige el tipo de comida: Desayuno, Almuerzo, Merienda, Cena, Snack.'],
    ],
  },
  {
    id: 'admin', icon: Shield,
    title: 'Panel de Administración (Admin)',
    items: [
      [Dumbbell, 'Ejercicios: gestiona ejercicios de cualquier usuario, asigna del catálogo global, edita series/reps/GIF.'],
      [UtensilsCrossed, 'Dietas: edita los planes de dieta de cualquier usuario.'],
      [User, 'Medidas: registra y edita medidas corporales con fotos de cualquier usuario.'],
      [User, 'Usuarios: crea, edita y elimina usuarios. Al crear se generan 5 slots de rutina vacíos.'],
      [BookOpen, 'Catálogo Global: administra los 1000+ ejercicios con nombres español, grupos musculares y GIFs.'],
      [Zap, 'Agente IA: genera planes personalizados con IA (rutina + dieta).'],
      [FileText, 'Motivación: administra las frases motivacionales que ven todos los usuarios (una por día).'],
    ],
  },
  {
    id: 'tips', icon: Zap,
    title: 'Consejos Rápidos',
    items: [
      [Image, 'Haz clic en cualquier GIF de ejercicio para verlo en pantalla completa.'],
      [RefreshCw, 'Usa "Ver alternativas" en los ejercicios para encontrar variantes del mismo grupo muscular.'],
      [Clock, 'El temporizador de descanso se activa automáticamente al registrar un resultado.'],
      [TrendingUp, 'Revisa tus mini-gráficas en el Dashboard para ver tu progreso semanal.'],
      [Calendar, 'El calendario de 30 días te ayuda a mantener la consistencia.'],
      [Trophy, 'Revisa Records para saber cuándo subir de peso en tus ejercicios.'],
    ],
  },
]

function Section({ icon: Icon, title, items, startOpen }) {
  const [open, setOpen] = useState(startOpen)
  return (
    <div className="bg-gym-800/30 border border-gym-700/30 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 hover:bg-gym-800/50 transition">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gym-700/50">
            <Icon size={20} className="text-gym-300" />
          </div>
          <h2 className="text-white font-bold text-lg">{title}</h2>
        </div>
        <ChevronRight size={20} className={`text-gym-400 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4">
          {items.map(([ItemIcon, text], i) => (
            <div key={i} className="flex items-start gap-3 py-2.5 border-t border-gym-700/20">
              <div className="p-1.5 rounded-lg bg-gym-700/30 shrink-0 mt-0.5">
                <ItemIcon size={14} className="text-gym-400" />
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Manual() {
  const [allOpen, setAllOpen] = useState(false)
  return (
    <div className="min-h-screen bg-gym-900">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gym-700/50">
              <BookOpen size={28} className="text-gym-300" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Manual de Uso</h1>
              <p className="text-sm text-gray-400">Todo lo que necesitas saber sobre la plataforma</p>
            </div>
          </div>
          <button
            onClick={() => setAllOpen(!allOpen)}
            className="text-xs font-bold text-gym-300 hover:text-white bg-gym-700/50 hover:bg-gym-700 px-3 py-2 rounded-lg transition flex items-center gap-1.5"
          >
            {allOpen ? 'Cerrar todo' : 'Abrir todo'}
          </button>
        </div>

        <div className="space-y-4">
          {sections.map(s => (
            <Section key={s.id} icon={s.icon} title={s.title} items={s.items} startOpen={allOpen} />
          ))}
        </div>

        <div className="mt-8 p-4 bg-gym-800/30 border border-gym-700/30 rounded-xl text-center">
          <p className="text-sm text-gray-400">
            Plataforma creada por el <span className="text-gym-300 font-semibold">Ing. Jose Luis Enriquez</span>
          </p>
        </div>
      </div>
    </div>
  )
}
