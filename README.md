# MoneyTrack 💰

Aplicación móvil para el control de finanzas personales desarrollada con **React Native**, **Expo** y **TypeScript**.

## 🏗️ Arquitectura

Este proyecto utiliza el patrón **MVVM (Model-View-ViewModel)** implementado con:
- **Model**: Clases de datos tipadas (`src/models/`)
- **View**: Componentes de React (`src/screens/` y `src/components/`)
- **ViewModel**: Hooks y Context API (`src/context/` y `src/hooks/`)

## 💎 TypeScript

El proyecto está completamente escrito en **TypeScript** para:
- ✅ Type safety y detección temprana de errores
- ✅ Mejor experiencia de desarrollo con autocompletado
- ✅ Código más mantenible y documentado
- ✅ Refactoring seguro

## 📁 Estructura de Carpetas

```
MoneyTrack/
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── common/       # Componentes comunes (Button, Card)
│   │   └── transactions/ # Componentes de transacciones
│   ├── screens/          # Pantallas de la aplicación
│   ├── viewmodels/       # Lógica de negocio
│   ├── models/           # Modelos de datos
│   ├── services/         # Servicios (Storage, API)
│   ├── hooks/            # Custom hooks
│   ├── context/          # Context API para estado global
│   ├── utils/            # Funciones auxiliares
│   └── constants/        # Constantes (colores, categorías)
├── assets/               # Recursos (imágenes, iconos)
├── App.js               # Punto de entrada
└── app.json             # Configuración de Expo
```

## 📦 Dependencias

- **expo**: Framework para desarrollo móvil
- **react-native**: Framework UI
- **typescript**: Tipado estático
- **@react-native-async-storage/async-storage**: Almacenamiento local
- **@types/react** y **@types/react-native**: Tipos para TypeScript

## 🛠️ Instalación y Uso

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar el servidor de desarrollo:
```bash
npm start
```

3. Escanear el código QR con:
   - **Android**: Expo Go app
   - **iOS**: Cámara del iPhone

## 📱 Comandos Disponibles

- `npm start` - Inicia el servidor de desarrollo
- `npm run android` - Abre en emulador Android
- `npm run ios` - Abre en simulador iOS (requiere macOS)
- `npm run web` - Abre versión web

---
