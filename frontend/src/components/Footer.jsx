import React from 'react'

export default function Footer() {
  return (
    <footer className="border-t border-gym-700/30 mt-16">
      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <img src="https://enriquezmania.com/wp-content/uploads/2024/08/logo.png" alt="EnriquezMania" className="h-6 w-auto" />
          <span className="text-sm font-bold text-white">EnriquezMania</span>
        </div>
        <p className="text-xs text-gray-500">
          Plataforma creada por el <span className="text-gray-300 font-semibold">Ing. Jose Luis Enriquez</span>
        </p>
      </div>
    </footer>
  )
}
