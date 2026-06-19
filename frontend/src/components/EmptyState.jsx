import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title = 'Sin datos', description = '', action, variant = 'default' }) {
  const variants = {
    default: {
      container: 'flex flex-col items-center justify-center py-12 text-center',
      icon: 'w-16 h-16 bg-gym-800/50 rounded-2xl flex items-center justify-center mb-4',
      iconSize: 28,
      iconColor: 'text-gym-500',
    },
    ghost: {
      container: 'flex flex-col items-center justify-center py-8 text-center',
      icon: 'w-12 h-12 bg-gym-800/30 rounded-xl flex items-center justify-center mb-3',
      iconSize: 20,
      iconColor: 'text-gym-500/60',
    },
  }

  const v = variants[variant] || variants.default

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={v.container}
    >
      <div className={v.icon}>
        <Icon size={v.iconSize} className={v.iconColor} />
      </div>
      <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
      {description && <p className="text-gray-500 text-sm max-w-xs leading-relaxed">{description}</p>}
      {action && <motion.div whileHover={{ scale: 1.03 }} className="mt-4">{action}</motion.div>}
    </motion.div>
  )
}
