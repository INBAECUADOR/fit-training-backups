import { useEffect } from 'react'

const SITE = 'EnriquezMania - Entrenamiento Personalizado'
const BASE = 'https://app.enriquezmania.com'
const DEFAULT_DESC = 'App de entrenamiento personalizado. Genera rutinas, dieta y haz seguimiento de tu evolución con fotos y métricas.'
const DEFAULT_IMG = 'https://enriquezmania.com/wp-content/uploads/2024/08/logo.png'

const PAGES = {
  '/': { title: SITE, desc: DEFAULT_DESC },
  '/login': { title: `Iniciar Sesión — ${SITE}`, desc: 'Accede a tu cuenta de EnriquezMania para ver tus rutinas, dieta y evolución.' },
  '/routine': { title: `Rutina — ${SITE}`, desc: 'Tu plan de entrenamiento personalizado con ejercicios, series y repeticiones.' },
  '/diet': { title: `Dieta — ${SITE}`, desc: 'Plan de alimentación personalizado con comidas y macronutrientes.' },
  '/evolution': { title: `Evolución — ${SITE}`, desc: 'Seguimiento de tus medidas corporales y fotos de progreso.' },
  '/pr-board': { title: `Records — ${SITE}`, desc: 'Tus marcas personales en cada ejercicio.' },
  '/calories': { title: `Calorías — ${SITE}`, desc: 'Calcula y registra tus calorías diarias con nuestra base de alimentos.' },
  '/admin': { title: `Admin — ${SITE}`, desc: 'Panel de administración de la plataforma.' },
  '/ai-agent': { title: `Generador — ${SITE}`, desc: 'Genera rutinas y dietas personalizadas automáticamente.' },
  '/manual': { title: `Manual de Usuario — ${SITE}`, desc: 'Guía completa de uso de la plataforma EnriquezMania.' },
}

export default function SEO({ path, title, desc, image }) {
  useEffect(() => {
    const p = PAGES[path] || { title: SITE, desc: DEFAULT_DESC }
    const finalTitle = title || p.title
    const finalDesc = desc || p.desc
    const finalImage = image || DEFAULT_IMG
    const url = BASE + path

    document.title = finalTitle

    const setMeta = (name, content, prop = 'name') => {
      let el = document.querySelector(`meta[${prop}="${name}"]`)
      if (!el) { el = document.createElement('meta'); el.setAttribute(prop, name); document.head.appendChild(el) }
      el.setAttribute('content', content)
    }

    setMeta('description', finalDesc)
    setMeta('og:title', finalTitle, 'property')
    setMeta('og:description', finalDesc, 'property')
    setMeta('og:image', finalImage, 'property')
    setMeta('og:url', url, 'property')
    setMeta('twitter:title', finalTitle)
    setMeta('twitter:description', finalDesc)
    setMeta('twitter:image', finalImage)
  }, [path, title, desc, image])

  return null
}
