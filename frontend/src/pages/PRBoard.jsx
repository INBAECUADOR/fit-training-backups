import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getPRs, downloadExport } from '../api'
import Navbar from '../components/Navbar'
import { useToast } from '../components/Toast'
import { Trophy, Search, Dumbbell, Download } from 'lucide-react'

function estimate1RM(weight, reps) {
  if (!weight || !reps || reps < 1) return 0
  return Math.round(weight * (1 + reps / 30))
}

const stagger = {
  animate: { transition: { staggerChildren: 0.03 } }
}

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
}

export default function PRBoard() {
  const [prs, setPrs] = useState(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('weight')
  const [loading, setLoading] = useState(true)

  const { showToast } = useToast()

  useEffect(() => {
    getPRs()
      .then(setPrs)
      .catch(() => { setPrs([]); showToast('Error al cargar records', 'error') })
      .finally(() => setLoading(false))
  }, [])

  const filtered = (prs || [])
    .filter(p => p.exercise_name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'weight') return b.best_weight - a.best_weight
      if (sortBy === 'reps') return b.best_reps - a.best_reps
      if (sortBy === '1rm') return estimate1RM(b.best_weight, b.best_reps) - estimate1RM(a.best_weight, a.best_reps)
      return 0
    })

  return (
    <div className="min-h-screen bg-gym-900">
      <Navbar />
      <motion.div initial="initial" animate="animate" variants={stagger} className="max-w-4xl mx-auto px-4 py-8">
        <motion.div variants={fadeUp} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
              <Trophy size={24} className="text-yellow-400" />
              Records Personales
            </h1>
            <p className="text-gray-400 text-sm mt-1">Tus mejores marcas en cada ejercicio</p>
          </div>
          <div className="text-right flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => downloadExport('results')}
              className="p-2 bg-gym-800 hover:bg-gym-700 border border-gym-700/50 rounded-lg text-gray-400 hover:text-white transition-all"
              title="Exportar resultados a CSV"
            >
              <Download size={16} />
            </motion.button>
            <div>
              <p className="text-2xl font-extrabold text-gym-300">{prs?.length || 0}</p>
              <p className="text-xs text-gray-500">ejercicios con PR</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar ejercicio..."
              className="w-full pl-9 pr-4 py-2.5 bg-gym-800 border border-gym-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gym-400 focus:ring-1 focus:ring-gym-400/30 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {[
              { key: 'weight', label: 'Peso' },
              { key: 'reps', label: 'Reps' },
              { key: '1rm', label: '1RM' },
            ].map(btn => (
              <button
                key={btn.key}
                onClick={() => setSortBy(btn.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  sortBy === btn.key
                    ? 'bg-gradient-to-r from-gym-400 to-orange-500 text-white shadow-lg shadow-gym-400/30'
                    : 'bg-gym-800 text-gray-400 hover:bg-gym-700 border border-gym-700/50'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </motion.div>

        {prs === null ? (
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="shimmer bg-gym-800/50 rounded-xl p-4 h-16" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div variants={fadeUp} className="text-center py-20">
            <Trophy size={40} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">
              {prs.length === 0 ? 'Aún no tenés records. Registrá resultados en tus ejercicios.' : 'No se encontraron ejercicios'}
            </p>
          </motion.div>
        ) : (
          <motion.div variants={stagger} className="space-y-2">
            {filtered.map((pr, i) => (
              <motion.div key={pr.exercise_id} variants={fadeUp} whileHover={{ x: 4 }} className="bg-gym-800/50 border border-gym-700/30 rounded-xl px-4 py-3 hover:bg-gym-800/70 transition-all flex items-center justify-between cursor-default">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-gradient-to-br from-yellow-500 to-amber-400 rounded-lg shrink-0">
                    <Trophy size={14} className="text-gym-900" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{pr.exercise_name}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {pr.day_label} &middot; {pr.total_logs} registro{pr.total_logs !== 1 ? 's' : ''}
                      {pr.achieved_at && <> &middot; {new Date(pr.achieved_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-3">
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-gym-300">{pr.best_weight} <span className="text-[10px] font-normal text-gray-500">kg</span></p>
                    <p className="text-[10px] text-gray-500">peso</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-gym-200">{pr.best_reps} <span className="text-[10px] font-normal text-gray-500">reps</span></p>
                    <p className="text-[10px] text-gray-500">máximas</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-gym-400">
                      {estimate1RM(pr.best_weight, pr.best_reps) > 0
                        ? `${estimate1RM(pr.best_weight, pr.best_reps)} kg`
                        : '-'}
                    </p>
                    <p className="text-[10px] text-gray-500">1RM est.</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
