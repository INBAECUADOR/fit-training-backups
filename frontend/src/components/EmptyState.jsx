import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title = 'Sin datos', description = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-gym-800/50 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={28} className="text-gym-500" />
      </div>
      <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
      {description && <p className="text-gray-500 text-sm max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
