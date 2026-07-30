# CREA-EF 🏃‍♂️📘

**CREA-EF** es una plataforma web orientada a docentes de Educación Física para la creación, gestión y evaluación asistida por Inteligencia Artificial (Google Gemini) de Situaciones de Aprendizaje (SDA), programaciones docentes y recursos pedagógicos adaptados al currículo educativo.

---

## 🚀 Características Principales

- 🤖 **Generador de SDA asistido por IA (Google Gemini)**: Creación guiada de situaciones de aprendizaje para Educación Física.
- 📂 **Gestor de Situaciones de Aprendizaje (SDA)**: Guardado, edición, duplicación y exportación de unidades didácticas.
- 👥 **Gestión de Usuarios y Roles**: Autenticación mediante Firebase y almacenamiento con respaldo local/nube.
- 💳 **Integración de Pagos con Stripe**: Suscripciones y pasarela de pago para funciones premium.
- 📄 **Exportación a PDF / Excel / Word**: Descarga directa de las unidades docentes generadas.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React, Motion (Framer Motion).
- **Backend / Servidor**: Express.js, Node.js (con ejecutor TypeScript `tsx`).
- **IA**: API de Google Gen AI (`@google/genai`).
- **Autenticación y Persistencia**: Firebase Auth & Firestore.
- **Herramientas de Compilación**: Vite & esbuild.

---

## 💻 Requisitos Previos e Instalación

### 1. Requisitos Previos

- **Node.js** (versión 18 o superior)
- **npm** o **yarn**

### 2. Instalación de Dependencias

```bash
npm install
```

### 3. Configuración de Variables de Entorno

Copia el archivo `.env.example` y renómbralo a `.env`:

```bash
cp .env.example .env
```

Abre `.env` y configura tus credenciales:

```env
# Gemini API Key (Obtener en Google AI Studio)
GEMINI_API_KEY=tu_clave_gemini

# Firebase Configuration
VITE_FIREBASE_API_KEY=tu_firebase_api_key
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_FIREBASE_AUTH_DOMAIN=tu_project_id.firebaseapp.com

# Stripe Configuration (Opcional)
STRIPE_SECRET_KEY=tu_stripe_secret_key
VITE_STRIPE_PUBLISHABLE_KEY=tu_stripe_pub_key
```

---

## 🏃‍♂️ Ejecución en Desarrollo

Para iniciar el servidor de desarrollo y la aplicación:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000` (o el puerto configurado).

---

## 📦 Compilación para Producción

Para compilar la aplicación cliente y el servidor backend:

```bash
npm run build
```

Para iniciar el servidor compilado en producción:

```bash
npm run start
```

---

## 📜 Licencia

Proyecto privado. Todos los derechos reservados CREA-EF.
