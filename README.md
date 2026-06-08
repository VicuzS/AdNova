# ⚡ AdNova.ai — Automatización Publicitaria con IA

> Crea contenido y responde clientes automáticamente. Una plataforma SaaS para negocios locales, emprendedores y agencias que quieren escalar su presencia digital sin conocimientos técnicos.

---

## 📋 Tabla de Contenidos

- [Visión del Producto](#-visión-del-producto)
- [Funcionalidades](#-funcionalidades)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Scripts Disponibles](#-scripts-disponibles)
- [Páginas y Rutas](#-páginas-y-rutas)
- [Planes y Modelo de Negocio](#-planes-y-modelo-de-negocio)
- [Roadmap](#-roadmap)
- [Contribuir](#-contribuir)

---

## 🎯 Visión del Producto

**AdNova.ai** es una plataforma de automatización publicitaria pensada para negocios que venden por redes sociales y WhatsApp. Resuelve el problema más común del emprendedor digital: **no tener tiempo ni presupuesto para marketing profesional**.

Con AdNova.ai, cualquier negocio puede:

- Generar posts y copies listos para publicar en segundos
- Automatizar respuestas en WhatsApp sin código
- Crear videos publicitarios con IA para TikTok e Instagram
- Reducir costos de agencia manteniendo calidad profesional

**Segmentos objetivo:** restaurantes, barberías, tiendas físicas, emprendedores digitales y pequeñas agencias de marketing.

---

## ✨ Funcionalidades

### 🖼️ Generador de Anuncios IA
- Creación de anuncios por descripción de producto en texto libre
- Soporte para múltiples formatos: cuadrado (1:1), historia (9:16), banner (16:9), rectangular (4:5)
- Optimización por plataforma: Facebook, Instagram, TikTok, Google Ads, LinkedIn
- Objetivos configurables: ventas, reconocimiento, tráfico, generación de leads
- Vista previa en tiempo real del anuncio generado
- Carga de imagen del producto (hasta 5MB)

### 🎬 Videos IA
- Generación de videos publicitarios de 15, 30 y 60 segundos
- Estilos: cinematográfico, minimalista, dinámico, lifestyle
- Optimizados para TikTok, Instagram Reels, YouTube Shorts y Facebook

### 💬 WhatsApp Automatización
- Chatbots de respuesta automática configurables por negocio
- Secuencias de mensajes automatizadas (bienvenida, carrito abandonado, re-engagement)
- Simulador de conversación para probar flujos antes de activarlos
- Métricas: mensajes enviados, tasa de apertura, respuestas, conversiones

### 📊 Dashboard
- Gráfica de conversiones con vistas de 7 y 30 días
- Historial de campañas activas con métricas de ROI
- Monitor de créditos IA y mensajes de WhatsApp disponibles
- Estado del plan actual con accesos rápidos

### 🗂️ Historial y Galería
- Repositorio de todos los anuncios y videos generados
- Búsqueda y filtrado por nombre
- Visualización por tipo (imagen / video), plataforma y fecha

### 💳 Planes
- Vista comparativa de planes Básico, Pro y Empresa
- FAQ integrado
- Actualización de plan desde la interfaz

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework UI | React 18 |
| Bundler | Vite 5 |
| Routing | React Router DOM v6 |
| Gráficas | Recharts 2 |
| Iconos | Lucide React |
| Fuentes | Plus Jakarta Sans, DM Mono |
| Estilos | CSS Modules (custom design system) |
| Despliegue | Compatible con Vercel, Netlify, AWS Amplify |

### Proveedores de IA (integración planeada)
- OpenAI (generación de texto e imágenes)
- Anthropic Claude (razonamiento y chatbot)
- Meta AI (modelos open source)

### Infraestructura planeada
- Cloud: AWS / GCP / Azure
- Base de datos: Firebase o PostgreSQL
- Mensajería: WhatsApp Business API

---

## 📁 Estructura del Proyecto

```
adnova-dashboard/
├── public/
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # Shell principal: sidebar + topbar
│   │   └── Layout.css
│   ├── pages/
│   │   ├── Dashboard.jsx       # Vista principal con métricas
│   │   ├── Dashboard.css
│   │   ├── GeneradorAnuncios.jsx
│   │   ├── Videos.jsx
│   │   ├── WhatsApp.jsx
│   │   ├── Historial.jsx
│   │   ├── Planes.jsx
│   │   └── PageBase.css        # Estilos compartidos entre páginas
│   ├── App.jsx                 # Definición de rutas
│   ├── main.jsx                # Entry point
│   └── index.css               # Design tokens (CSS variables globales)
├── index.html
├── vite.config.js
└── package.json
```

### Design System

El proyecto usa un sistema de diseño propio basado en CSS variables definidas en `index.css`:

```css
--blue-primary: #1A56DB   /* Acción principal */
--green:        #10B981   /* Estados positivos */
--yellow:       #F59E0B   /* Alertas */
--red:          #EF4444   /* Errores / peligro */
--gray-*        /* Escala de grises 50–900 */
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- npm 8+

### Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/adnova-ai.git
cd adnova-ai/frontend
```

### Instalar dependencias

```bash
npm install
```

### Iniciar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

---

## 📜 Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo con HMR |
| `npm run build` | Genera el bundle de producción en `/dist` |
| `npm run preview` | Previsualiza el build de producción localmente |

---

## 🗺️ Páginas y Rutas

| Ruta | Página | Descripción |
|---|---|---|
| `/dashboard` | Dashboard | Métricas, campañas recientes y resumen del plan |
| `/generador` | Generador de Anuncios | Creación de anuncios con IA |
| `/videos` | Videos IA | Generación de videos publicitarios |
| `/whatsapp` | WhatsApp Auto. | Automatización de mensajes y secuencias |
| `/historial` | Historial y Galería | Repositorio de contenido generado |
| `/planes` | Planes | Comparativa de planes y precios |

---

## 💰 Planes y Modelo de Negocio

| | Básico | Pro | Empresa |
|---|---|---|---|
| **Precio** | S/ 49 / mes | S/ 99 / mes | S/ 199 / mes |
| Créditos IA | 20–30 contenidos | 100 contenidos | Ilimitado |
| Chatbots WhatsApp | 1 básico | 2–3 + integración | Múltiples cuentas |
| Videos Pro | ✗ | ✓ | ✓ |
| Soporte | Email | Prioritario | Personalizado |

**Inversión inicial estimada (MVP):**
- Desarrollo MVP: S/ 2,000
- Diseño UI/UX: S/ 500
- Dominio + setup técnico: S/ 200

**Costos operativos mensuales:**
- Infraestructura cloud: S/ 150
- APIs de IA: S/ 300
- Herramientas SaaS: S/ 100
- Marketing digital: S/ 300
- Soporte y operación: S/ 150

---

## 🛣️ Roadmap

### v0.1 — MVP Frontend *(actual)*
- [x] Dashboard con métricas y gráficas
- [x] Generador de anuncios (UI completa)
- [x] Módulo de Videos IA
- [x] WhatsApp con simulador y secuencias
- [x] Historial y galería
- [x] Vista de planes y precios

### v0.2 — Integración Backend
- [ ] Autenticación de usuarios (JWT / OAuth)
- [ ] Conexión a API de IA (OpenAI / Anthropic)
- [ ] Generación real de imágenes con DALL-E o Stable Diffusion
- [ ] Base de datos para historial persistente
- [ ] Sistema de créditos funcional

### v0.3 — WhatsApp & Automatización
- [ ] Integración con WhatsApp Business API
- [ ] Activación y gestión real de secuencias
- [ ] Webhooks para respuestas automáticas
- [ ] Panel de conversaciones en tiempo real

### v1.0 — Lanzamiento
- [ ] Pagos con Stripe / Culqi (mercado peruano)
- [ ] Onboarding guiado para nuevos usuarios
- [ ] Analytics avanzados por campaña
- [ ] App móvil (React Native)

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para cambios mayores, abre primero un issue para discutir qué te gustaría modificar.

1. Haz fork del repositorio
2. Crea tu rama de feature: `git checkout -b feature/nueva-funcionalidad`
3. Haz commit de tus cambios: `git commit -m 'feat: agrega nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 👥 Equipo

| Rol | Nombre |
|---|---|
| Product & Strategy | Lopez Salinas Leonardo |
| Design & Frontend | Vera Leonardo |

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

<p align="center">
  Construido con ❤️ para emprendedores latinoamericanos
  <br/>
  <strong>AdNova.ai</strong> — IA Automatización Publicitaria
</p>
