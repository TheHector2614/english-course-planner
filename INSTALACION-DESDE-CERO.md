# Instalación de OpenCode + English Teacher Designer

> Guía paso a paso para personas sin experiencia en programación.  
> Al finalizar tendrás un asistente AI que crea materiales didácticos de inglés interactivos.

---

## Índice

1. [¿Qué es OpenCode?](#1-qu%C3%A9-es-opencode)
2. [Requisitos](#2-requisitos)
3. [Instalar Node.js](#3-instalar-nodejs)
4. [Instalar OpenCode](#4-instalar-opencode)
5. [Obtener una clave API](#5-obtener-una-clave-api)
6. [Crear la carpeta del proyecto](#6-crear-la-carpeta-del-proyecto)
7. [Copiar la configuración del agente](#7-copiar-la-configuraci%C3%B3n-del-agente)
8. [Instalar las 10 skills de diseño](#8-instalar-las-10-skills-de-dise%C3%B1o)
9. [Abrir OpenCode por primera vez](#9-abrir-opencode-por-primera-vez)
10. [Usar el asistente de inglés](#10-usar-el-asistente-de-ingl%C3%A9s)
11. [Solución de problemas](#11-soluci%C3%B3n-de-problemas)
12. [Para compartir con otro profesor](#12-para-compartir-con-otro-profesor)

---

## 1. ¿Qué es OpenCode?

OpenCode es un asistente AI que trabaja dentro de tu computadora. No es una página web — es un programa que se abre en una ventana de texto (terminal) y puede:

- **Escribir código HTML** para crear actividades interactivas
- **Leer y modificar archivos** en tu carpeta de proyectos
- **Buscar información en internet** cuando se lo pides
- **Usar "skills"** (habilidades extra) que le enseñan a hacer tareas específicas

En este caso lo configuraremos como un **profesor de inglés** que crea quizzes, flashcards, lecturas, y ejercicios interactivos.

---

## 2. Requisitos

| Qué necesitas | Notas |
|---------------|-------|
| **Windows 10 u 11** | Esta guía es para Windows |
| **Conexión a internet** | Solo para la instalación y para usar el asistente |
| **Una cuenta de email** | Para crear la clave API |
| **10-15 minutos** | Tiempo total de instalación |

No necesitas saber programar. Solo seguir los pasos.

---

## 3. Instalar Node.js

Node.js es un programa necesario para que OpenCode funcione.

### Paso 1: Descargar

1. Abre tu navegador (Chrome, Edge, etc.)
2. Ve a **https://nodejs.org**
3. Verás dos botones verdes. Haz clic en el que dice **LTS** (Recommended for Most Users)
   - Se descargará un archivo llamado `node-v22.x.x-x64.msi`

### Paso 2: Instalar

1. Abre el archivo `.msi` que se descargó
2. Haz clic en **Next** (Siguiente) en todas las pantallas
3. Marca **"I accept the terms"** si aparece
4. Haz clic en **Install** (Instalar)
5. Espera a que termine — verás una pantalla verde que dice "Completed"
6. Haz clic en **Finish** (Finalizar)

### Paso 3: Verificar

1. Presiona la tecla **Windows** y escribe **"PowerShell"**
2. Haz clic en **Windows PowerShell** (el primer resultado)
3. En la ventana que se abre, escribe este comando y presiona **Enter**:

```powershell
node --version
```

Si ves algo como `v22.x.x`, Node.js está instalado correctamente.

> **No cierres PowerShell** — lo usaremos en los pasos siguientes.

---

## 4. Instalar OpenCode

En la misma ventana de PowerShell, escribe este comando y presiona **Enter**:

```powershell
npm install -g opencode-ai
```

Verás líneas de texto moviéndose. Espera a que termine (puede tardar 1-2 minutos).  
Cuando termines, deberías ver algo como:

```
added X packages in Y seconds
```

Para verificar que se instaló bien:

```powershell
opencode --version
```

Si ves un número (ej: `0.x.x`), OpenCode está listo.

---

## 5. Obtener una clave API

OpenCode necesita una clave para conectarse a la AI que genera los materiales.

### Opción recomendada: OpenCode Zen (la más fácil)

1. En PowerShell, escribe:

```powershell
opencode
```

2. Se abrirá OpenCode. Presiona la tecla **`/`** (barra inclinada) para abrir el menú de comandos.
3. Escribe **`/connect`** y presiona **Enter**
4. Selecciona **opencode** con las flechas del teclado y presiona **Enter**
5. Se abrirá una página web en tu navegador: **https://opencode.ai/auth**
6. Crea una cuenta (email y contraseña)
7. Añade un método de pago (esto te da acceso a los modelos de AI)
8. Copia la clave API que aparece en la página (empieza con `sk-...`)
9. Vuelve a PowerShell y pega la clave (clic derecho pega) y presiona **Enter**

Ya tienes OpenCode configurado.

### Opción alternativa: OpenAI (ChatGPT)

Si ya tienes una cuenta de ChatGPT:

1. Ve a **https://platform.openai.com/api-keys**
2. Inicia sesión
3. Haz clic en **"Create new secret key"**
4. Dale un nombre como "opencode"
5. Copia la clave (empieza con `sk-...`)
6. En PowerShell:

```powershell
setx OPENAI_API_KEY "sk-tu-clave-aqui"
```

Luego cierra y abre PowerShell para que el cambio funcione.

---

## 6. Crear la carpeta del proyecto

OpenCode trabaja dentro de una carpeta específica.

1. Abre el **Explorador de Archivos** (carpeta amarilla en la barra de tareas)
2. Ve al lugar donde quieres guardar tus materiales (ej: Escritorio, Documentos)
3. Haz clic derecho → **Nuevo** → **Carpeta**
4. Nómbrala: `clases-ingles`
5. Dentro de la carpeta, haz clic derecho → **Nuevo** → **Documento de texto**
6. Nómbralo: `opencode.json` (tiene que ser `.json`, no `.txt`)

   > Si ves que se llama `opencode.json.txt`, tienes que activar las extensiones:
   > En el Explorador, haz clic en **Ver** → marcar **"Extensiones de nombre de archivo"**

7. Haz clic derecho en `opencode.json` → **Abrir con** → **Bloc de notas**
8. Copia y pega exactamente este contenido:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "default_agent": "english-teacher",
  "agent": {
    "english-teacher-designer": {
      "description": "Profesor de inglés que diseña materiales didácticos HTML con diseño UI profesional.",
      "mode": "subagent",
      "temperature": 0.7,
      "permission": {
        "edit": "allow",
        "skill": { "*": "allow" },
        "glob": "allow",
        "grep": "allow",
        "read": "allow",
        "webfetch": "allow",
        "bash": "deny"
      }
    }
  }
}
```

9. Guarda (Ctrl+S) y cierra el Bloc de notas

10. Dentro de la carpeta `clases-ingles`, crea otra carpeta llamada `.opencode`

    > Para crear una carpeta que empiece con punto en Windows:
    > Escribe `.opencode.` (con punto al final también) y presiona Enter.
    > Windows quitará el último punto automáticamente.

11. Dentro de `.opencode`, crea otra carpeta llamada `agents`

12. Dentro de `.opencode\agents`, crea un archivo llamado `english-teacher-designer.md`
    - Ábrelo con Bloc de notas
    - Copia y pega el contenido del **Apéndice A** (al final de esta guía)
    - Guarda y cierra

Tu estructura debe verse así:

```
clases-ingres/
├── .opencode/
│   └── agents/
│       └── english-teacher-designer.md
└── opencode.json
```

---

## 7. Copiar la configuración del agente

Si alguien ya te dio estos archivos, simplemente cópialos a tu carpeta `clases-ingles`:

1. **`opencode.json`** → pégalo en `clases-ingles/`
2. **`english-teacher-designer.md`** → pégalo en `clases-ingles/.opencode/agents/`

Si estás empezando desde cero, los archivos ya quedaron creados en el paso anterior. Continúa.

---

## 8. Instalar las 10 skills de diseño

Las skills son conocimientos extra que le damos al asistente para que cree materiales más bonitos y profesionales.

### Abre PowerShell en la carpeta correcta

1. Abre la carpeta `clases-ingles` en el Explorador de Archivos
2. Haz clic en la **barra de direcciones** (arriba, donde dice la ruta)
3. Borra lo que hay, escribe **`powershell`** y presiona **Enter**
4. Se abrirá PowerShell ya ubicado en tu carpeta

### Ejecuta las instalaciones

Copia y pega **una por una** estas líneas (cada una tarda unos segundos):

```powershell
npx skills add anthropics/frontend-design-skill --skill frontend-design -y
```

```powershell
npx skills add emilkowalski/emil-design-eng --skill emil-design-eng -y
```

```powershell
npx skills add raphaelsalaja/make-interfaces-feel-better --skill make-interfaces-feel-better -y
```

```powershell
npx skills add ibelick/baseline-ui --skill baseline-ui -y
```

```powershell
npx skills add leonxlnx/design-taste-frontend --skill design-taste-frontend -y
```

```powershell
npx skills add addyosmani/web-quality-audit --skill web-quality-audit -y
```

```powershell
npx skills add wshobson/wcag-audit-patterns --skill wcag-audit-patterns -y
```

```powershell
npx skills add raphaelsalaja/12-principles-of-animation --skill 12-principles-of-animation -y
```

```powershell
npx skills add jakubkrehel/oklch-skill --skill oklch-skill -y
```

```powershell
npx skills add wshobson/interaction-design --skill interaction-design -y
```

### Verificar

Después de las 10, escribe:

```powershell
ls $env:USERPROFILE\.agents\skills\
```

Deberías ver 10 carpetas: `frontend-design`, `emil-design-eng`, `make-interfaces-feel-better`, etc.

---

## 9. Abrir OpenCode por primera vez

Asegúrate de que PowerShell sigue en la carpeta `clases-ingles`. Luego escribe:

```powershell
opencode
```

Se abrirá OpenCode. La primera vez verás:

1. Un mensaje de bienvenida
2. OpenCode analizará la carpeta
3. Verás un cursor parpadeando donde puedes escribir

Para salir de OpenCode en cualquier momento: escribe `/exit` y presiona Enter.

---

## 10. Usar el asistente de inglés

Una vez dentro de OpenCode, tienes dos formas de usar al profesor de inglés:

### Opción 1: Como agente principal (más fácil)

El agente `english-teacher` (sin skills de diseño) ya está activo por defecto.  
Puedes pedirle directamente:

```
Crea un quiz de 10 preguntas sobre present perfect vs past simple para nivel B1 en HTML
```

### Opción 2: Con skills de diseño (materiales más bonitos)

Para activar el asistente con skills de diseño, escribe **`@english-teacher-designer`** seguido de tu petición:

```
@english-teacher-designer Crea un quiz de 10 preguntas sobre present perfect vs past simple para nivel B1. Incluye feedback inmediato y diseño profesional.
```

### Ejemplos de uso

```
@english-teacher-designer Diseña 8 flashcards interactivas sobre phrasal verbs comunes. Cada una con ejemplo, traducción y animación de volteo.
```

```
@english-teacher-designer Haz una actividad de reading comprehension sobre cambio climático para B2. 300 palabras + 5 preguntas
```

```
@english-teacher-designer Crea un drag & drop para ordenar oraciones en present continuous. Nivel A2.
```

### ¿Qué hacer con el resultado?

1. OpenCode generará código HTML completo
2. Puedes copiarlo y guardarlo como archivo `.html`
3. Abre ese archivo con tu navegador (Chrome, Edge) — funcionará sin internet
4. Puedes compartir el archivo con tus estudiantes

Para guardar archivos, puedes decirle:

```
@english-teacher-designer Crea un quiz sobre present perfect y guarda el HTML como "quiz-present-perfect.html"
```

---

## 11. Solución de problemas

| Problema | Solución |
|----------|----------|
| `npm` no se reconoce | Node.js no se instaló bien. Vuelve al paso 3 |
| `opencode` no se reconoce | Cierra y abre PowerShell de nuevo. Si sigue, reinstala: `npm install -g opencode-ai` |
| "No module named..." | Es normal con algunas skills de Python. No afecta al uso |
| OpenCode no encuentra las skills | Verifica: `ls $env:USERPROFILE\.agents\skills\` deben verse 10 carpetas |
| La clave API no funciona | Ve a https://opencode.ai/auth y genera una nueva |
| "Permission denied" | Abre PowerShell como **Administrador** (clic derecho → Ejecutar como administrador) |
| El agente `@english-teacher-designer` no aparece | Verifica que `opencode.json` y el archivo `.md` estén en las rutas correctas |
| OpenCode se ve raro (caracteres extraños) | Usa **Windows Terminal** (instálalo gratis desde Microsoft Store) |

---

## 12. Para compartir con otro profesor

Para darle esta configuración a otro profesor, solo necesitan los archivos de configuración.  
No necesitan reinstalar las skills si ya están instaladas en su computadora.

### Opción A: Ambos en la misma computadora

Si ya instalaste las skills, el otro profesor solo necesita:

1. Crear su carpeta de proyecto
2. Copiar los archivos:

```
clases-ingles/
├── .opencode/
│   └── agents/
│       └── english-teacher-designer.md
└── opencode.json
```

3. Abrir OpenCode en su carpeta y usar `@english-teacher-designer`

### Opción B: Computadora nueva

La otra persona debe:

1. Seguir los pasos **3** (Node.js) y **4** (OpenCode) de esta guía
2. Copiar los archivos de configuración
3. Ejecutar los 10 comandos de instalación de skills (paso **8**)
4. Listo

---

## Apéndice A: Contenido de english-teacher-designer.md

Este es el archivo que define al asistente. Cópialo exactamente:

```markdown
---
description: "Profesor de inglés especializado en crear materiales didácticos HTML interactivos con diseño UI profesional. CLT/TBLT/gamification. Usa skills de ui-skills.com para generar actividades visualmente pulidas."
mode: subagent
color: "#22c55e"
permission:
  skill:
    "*": "allow"
  edit: "allow"
  bash: "deny"
  webfetch: "allow"
---

Eres un profesor de inglés que diseña materiales didácticos interactivos en HTML/CSS. Tu prioridad es la enseñanza; el diseño UI es un medio para crear actividades más efectivas y atractivas.

## Metodología de enseñanza

- **CLT (Communicative Language Teaching)**: tareas comunicativas del mundo real
- **TBLT (Task-Based Language Teaching)**: aprender haciendo, con objetivos concretos
- **Gamificación**: puntos, niveles, retos, progresión
- **AI-Assisted**: retroalimentación inmediata, adaptación al nivel del estudiante

Usa niveles CEFR (A1-C2) para todo el contenido.

## Skills de diseño disponibles

Usa estas skills para crear materiales HTML visualmente profesionales. Cárgalas con `skill({ name: "..." }).

### Para actividades de estudiantes
- **`make-interfaces-feel-better`** — Pulido fino: border radius, sombras, alineación óptica. Úsalo siempre en toda actividad HTML.
- **`baseline-ui`** — Guarda-raíles anti-slop: animaciones solo cuando aporten, tipografía legible, contraste suficiente.
- **`oklch-skill`** — Paletas de color perceptualmente uniformes. Ideal para temas claros/oscuros en ejercicios.
- **`interaction-design`** — Micro-interacciones: feedback visual en quizzes, hover en tarjetas, transiciones entre ejercicios.
- **`12-principles-of-animation`** — Animaciones con propósito: timing, easing, resultados interactivos.

### Para diseño instruccional
- **`frontend-design`** — Filosofía de diseño distintivo. Úsalo al planear la estructura visual de una lección.
- **`emil-design-eng`** — Detalles invisibles que hacen que un ejercicio se sienta profesional.
- **`design-taste-frontend`** — Anti-slop: evita que las actividades se vean genéricas o generadas por IA.

### Para calidad y accesibilidad
- **`web-quality-audit`** — Auditoría completa: rendimiento, accesibilidad, SEO, buenas prácticas.
- **`wcag-audit-patterns`** — Accesibilidad WCAG 2.2 AA. Garantiza que todos los estudiantes puedan usar tus materiales.

## Flujo de trabajo

1. **Planificar la lección** — Define objetivo CEFR, audiencia, duración, tipo de actividad
2. **Cargar skills de diseño** — `frontend-design`, `baseline-ui`, `make-interfaces-feel-better`
3. **Crear actividad HTML** — Autocontenida, mobile-friendly, interactiva
4. **Verificar accesibilidad** — `wcag-audit-patterns` + `oklch-skill` para contraste
5. **Entregar** — Código HTML + instrucciones para el estudiante + guía para el profesor

## Reglas de diseño para materiales educativos

- Contraste mínimo WCAG AA 4.5:1 (texto normal) y 3:1 (texto grande)
- NUNCA uses colores solo para transmitir información (estudiantes con daltonismo)
- Tipografía mínima 16px para cuerpo de texto, 14px como mínimo absoluto
- Áreas táctiles mínimas de 48px para interacciones mobile
- Animaciones solo con propósito educativo (feedback, transición entre pasos)
- Respeta `prefers-reduced-motion`
- Las actividades deben funcionar offline (sin dependencias externas)
- Incluye siempre `alt` text descriptivo en imágenes y elementos decorativos
- Los quizzes y ejercicios deben dar feedback inmediato (correcto/incorrecto + explicación)

## Formatos de actividad

- **Quiz interactivo** — Multiple choice con feedback inmediato
- **Fill-in-the-blanks** — Inputs con validación y pistas
- **Drag & drop** — Ordenar palabras, emparejar conceptos
- **Flashcards** — Cara y dorso con animación de volteo
- **Role-play** — Escenario conversacional con opciones
- **Writing prompt** — Área de texto con checklist de criterios
- **Listening activity** — Transcripción + preguntas de comprensión
- **Reading comprehension** — Texto + preguntas de inferencia y vocabulario

## Output esperado

Toda actividad HTML debe incluir al final:
1. **Nivel CEFR** y objetivo de aprendizaje
2. **Instrucciones** claras en inglés (con opción de ver en español)
3. **Código HTML** autocontenido (todo en un archivo)
4. **Guía para el profesor** con sugerencias de uso y variaciones
```

---

> **¿Problemas?** Pregunta en el chat o contacta a quien te compartió esta guía.  
> **¿Quieres aprender más?** Los comandos de OpenCode se ven presionando `/` dentro del programa.
