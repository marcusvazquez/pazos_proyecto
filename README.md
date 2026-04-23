# 🌸 Brilla

Aplicación móvil en **React Native (Expo)** de educación emocional.
Envía **3 notificaciones diarias** con cumplidos, afirmaciones y frases de ánimo para mantener la autoestima alta.

Funciona **100% offline** — sin login, sin cuenta, sin internet.

---

## ✨ Características

- Splash animado con logo "Brilla"
- Onboarding de 3 slides con solicitud de permisos
- Pantalla principal con el mensaje del día
- Categorías: afirmación, logro, ánimo, gratitud (cada una con su color)
- Barra de racha de días consecutivos
- Historial de los últimos 7 días + favoritos guardables
- 3 horarios configurables (mañana / tarde / noche)
- Microanimaciones suaves (fade + scale)
- Español, tipografía redondeada Nunito

---

## 🎨 Paleta

| Color              | Hex        | Uso                      |
| ------------------ | ---------- | ------------------------ |
| Rosa suave         | `#F9A8D4`  | amor propio, calidez     |
| Lila / lavanda     | `#C4B5FD`  | calma, introspección     |
| Amarillo dorado    | `#FDE68A`  | alegría, energía         |
| Verde menta        | `#6EE7B7`  | crecimiento, bienestar   |
| Blanco cálido      | `#FAFAFA`  | fondo                    |
| Texto oscuro       | `#1E1B2E`  | contraste suave          |

---

## 🗂 Estructura

```
/src
  /screens          → SplashScreen, OnboardingScreen, HomeScreen,
                      HistoryScreen, SettingsScreen
  /components       → MessageCard, StreakBadge, CategoryTag,
                      NotificationItem, PrimaryButton
  /data             → messages.js   ← ÚNICO archivo para editar mensajes
  /notifications    → scheduleNotifications.js
  /theme            → colors.js, typography.js
  /store            → useAppStore.js (Zustand + AsyncStorage)
  /utils            → date.js
App.js              → Navegación + carga de fuentes + listener de notifs
```

---

## 💬 Editar los mensajes

> ⚠️ Los mensajes actuales son **placeholder**. El contenido final será
> reemplazado por el equipo antes del lanzamiento.

Todo el banco vive en un solo archivo:

```
src/data/messages.js
```

Para **agregar / editar / eliminar** un mensaje, solo modifica ese archivo.
Estructura:

```js
export const messages = {
  afirmaciones: [
    { id: "a01", text: "..." },
    { id: "a02", text: "..." },
  ],
  logros:   [ /* ... */ ],
  animos:   [ /* ... */ ],
  gratitud: [ /* ... */ ],
};
```

Reglas:

- Los `id` deben ser únicos dentro de cada categoría.
- No se toca ningún otro archivo para cambiar contenido.
- La app rota los mensajes **sin repetir** hasta agotar el banco.

---

## 📦 Instalación

Requiere **Node.js ≥ 18** y **Expo CLI**.

```bash
cd Brilla
npm install
npx expo start
```

Luego escanea el QR con la app **Expo Go** (Android / iOS) o abre en un
emulador con `a` (Android) o `i` (iOS).

### Dependencias principales

| Paquete                                    | Función                          |
| ------------------------------------------ | -------------------------------- |
| `expo`                                     | Runtime                          |
| `expo-notifications`                       | Notificaciones locales           |
| `expo-linear-gradient`                     | Degradados                       |
| `@react-native-async-storage/async-storage`| Persistencia                     |
| `@react-navigation/native` + `native-stack`| Navegación                       |
| `zustand`                                  | Estado global                    |
| `react-native-reanimated`                  | Microanimaciones                 |
| `@expo-google-fonts/nunito`                | Tipografía                       |
| `@react-native-community/datetimepicker`   | Selector de hora                 |

---

## 🔔 Notificaciones

- Se programan **3 notificaciones locales diarias** que se repiten.
- Cada notificación trae un mensaje diferente del banco.
- Al tocar una notificación, la app se abre **directo en la tarjeta** con
  ese mensaje (vía `data.messageId`).
- Los mensajes **rotan sin repetirse** hasta agotar todas las frases,
  luego se reinicia el pool.
- Los horarios se guardan en `AsyncStorage` y se reprograman automáticamente
  al cambiar cualquier slot.

### Horarios por defecto

- 🌅 **Mañana** — 8:00
- ☀️ **Tarde**  — 13:00
- 🌙 **Noche**  — 20:00

Todos editables desde la pantalla de **Configuración** con un selector
de hora nativo.

---

## 🧠 Estado (Zustand)

Persistido en `AsyncStorage` bajo la key `brilla-app-storage`:

- `hasOnboarded`             — booleano
- `notificationsPermission`  — `granted` / `denied` / `undetermined`
- `currentMessage`           — mensaje visible en Home
- `usedIds`                  — ids ya mostrados (para rotación sin repetir)
- `history`                  — últimos mensajes recibidos (máx 60)
- `favorites`                — ids marcados con corazón
- `streak` / `lastOpenDay`   — racha de días consecutivos
- `schedule`                 — 3 slots (hora + minuto + enabled)

---

## 🎨 Detalles de diseño

- Tipografía **Nunito** (redondeada, cálida)
- Border-radius generoso (`20` / `28` en tarjetas grandes)
- Sin colores saturados ni elementos agresivos
- Fondo de la Home **cambia de color** según la categoría del mensaje
- Microanimaciones: fade + scale suave al refrescar un mensaje
- Gradientes suaves de 2 tonos por categoría

---

## 📱 Assets

Añade en `/assets` los siguientes archivos (placeholder o definitivos):

- `icon.png` — 1024×1024
- `adaptive-icon.png` — 1024×1024
- `splash.png` — 1284×2778
- `notification-icon.png` — 96×96 (blanco sobre transparente)
- `favicon.png` — 48×48

Sin estos assets, Expo usará defaults automáticamente durante desarrollo.

---

## 📄 Licencia

Privado — proyecto interno del equipo Brilla.
