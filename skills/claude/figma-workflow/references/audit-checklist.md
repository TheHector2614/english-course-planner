# Checklist de Auditoría de Diseño

Checklist a aplicar ANTES de generar código a partir de un diseño de Figma.

## 1. Consistencia con el design system

### Colores
- [ ] Todo color usado es una **variable** o **style** del design system (no hex hardcoded)
- [ ] No hay colores casi idénticos sin razón (ej: `#3B82F6` y `#3C82F7` en lugares distintos)
- [ ] Los modes de color (light/dark, brand A/B) están aplicados consistentemente
- [ ] Los colores semánticos se usan correctamente (`success` para éxito, `error` para errores)

**Cómo detectarlo**: `get_variable_defs` + `get_design_context` y comparar valores hex usados en nodos vs variables definidas.

### Tipografía
- [ ] Todo texto usa un **text style** del design system, no font properties manuales
- [ ] La jerarquía es coherente (h1 → h2 → h3 sin saltos arbitrarios)
- [ ] No hay tamaños "huérfanos" (ej: un texto de 17px cuando el sistema solo define 14/16/18)
- [ ] El line-height es consistente con el text style asignado
- [ ] Las font weights vienen del sistema (no se usan weights arbitrarios)

### Espaciado
- [ ] Los paddings/gaps usan tokens del sistema (4, 8, 16, 24, 32... o la escala que tenga el proyecto)
- [ ] No hay valores arbitrarios (ej: padding 13px, gap 7px)
- [ ] La densidad es consistente dentro de cada agrupación visual
- [ ] Los márgenes verticales entre secciones son consistentes

### Border radius, sombras, bordes
- [ ] Border radius usa tokens (`sm`, `md`, `lg`, `full`)
- [ ] Sombras vienen de effect styles del sistema
- [ ] Grosor de bordes consistente (típicamente 1px en todo el sistema)

## 2. Estructura técnica

### Auto Layout
- [ ] Todo frame usa Auto Layout (excepto containers absolutos justificados)
- [ ] Dirección correcta (horizontal/vertical según el contenido)
- [ ] Alineación apropiada (start/center/end + space-between donde aplique)
- [ ] Padding configurado por lado (no solo padding general cuando el diseño lo requiere)
- [ ] `Fill container` / `Hug contents` aplicados consistentemente

### Componentes
- [ ] Elementos repetidos son instancias de componentes (no copy-paste)
- [ ] No hay **detached instances** (instances desvinculadas del componente master)
- [ ] Las variantes están bien aplicadas (states, sizes, colors)
- [ ] Component properties usadas correctamente (boolean, text, instance swap, variant)
- [ ] Nested components estructurados (un Button dentro de un Card debe ser instance, no shape)

### Naming
- [ ] Frames y layers tienen nombres descriptivos (`Hero / Title`, no `Frame 234`)
- [ ] Componentes nombrados con convención clara (`Button / Primary / Default`)
- [ ] Páginas organizadas (no todo en una sola página gigante)
- [ ] Iconos identificados con nombres semánticos (`icon-search`, no `Vector 12`)

## 3. Accesibilidad

### Contraste de color (WCAG AA mínimo)

Calcular ratio entre texto y fondo:
- Texto normal (< 18px o < 14px bold): **mínimo 4.5:1**
- Texto grande (≥ 18px o ≥ 14px bold): **mínimo 3:1**
- Componentes UI y bordes: **mínimo 3:1**

Reportar cualquier combinación que no cumpla.

**Fórmula**:
```
L = 0.2126 * R + 0.7152 * G + 0.0722 * B  (con linearización sRGB)
ratio = (L_claro + 0.05) / (L_oscuro + 0.05)
```

### Tamaño de texto
- [ ] No hay texto < 12px (excepto casos justificados como legales)
- [ ] Body text idealmente 16px+

### Tamaño de targets táctiles
- [ ] Botones e interactivos ≥ 44x44px (área tocable, incluye padding)
- [ ] Espaciado entre targets táctiles ≥ 8px

### Estados
- [ ] Componentes interactivos tienen estados visibles (default, hover, focus, active, disabled)
- [ ] Focus state diseñado (no solo "outline del browser")
- [ ] Estados de error claramente diferenciados (no solo color, también icono o texto)

### Información no solo por color
- [ ] Errores/éxitos tienen icono + texto, no solo color rojo/verde
- [ ] Gráficos con leyenda textual, no solo colores
- [ ] Links distinguibles por más que el color (subrayado, peso, icono)

## 4. Responsive y adaptabilidad

- [ ] Si hay múltiples breakpoints, **todos están diseñados** (mobile, tablet, desktop)
- [ ] Los componentes están preparados para fill container (no width fijos arbitrarios)
- [ ] Hay versión mobile de elementos que cambian (navbar → hamburguesa, grid → stack)
- [ ] Imágenes con aspect ratio definido (no se distorsionarán en responsive)

## 5. Contenido

### Texto
- [ ] No hay "Lorem ipsum" en diseños finales (debería ser contenido real o representativo)
- [ ] No hay texto duplicado por descuido
- [ ] No hay typos evidentes
- [ ] Capitalization consistente (Title Case, sentence case, etc.)
- [ ] Longitudes representativas (un nombre corto y uno largo, para probar overflow)

### Imágenes
- [ ] Imágenes con nombres descriptivos en Figma (servirá como `alt` en código)
- [ ] No hay placeholders de gris/foto stock evidente en diseños finales
- [ ] Imágenes a resolución adecuada (mínimo 2x para Retina)

### Iconos
- [ ] Iconos consistentes (todos de la misma librería: lucide, heroicons, etc.)
- [ ] Tamaños estandarizados (16, 20, 24px)
- [ ] Stroke width consistente
- [ ] Color usando current color o variable, no hex hardcoded

## 6. Performance (consideraciones técnicas desde el diseño)

- [ ] Imágenes no son innecesariamente grandes (un avatar de 40px no necesita una foto 1920px)
- [ ] No hay efectos que generen recálculo costoso (sombras complejas en muchos elementos, blur en hover de listas grandes)
- [ ] Animaciones declaradas (Smart Animate) no son excesivas

## 7. Lo que se debe reportar al usuario

Estructura del reporte de auditoría:

```
## Auditoría del diseño

### 🔴 Críticos (bloquean implementación)
- Contraste insuficiente en botón secundario: ratio 3.1:1 (mínimo 4.5:1)
- Estado de foco no diseñado en inputs del formulario

### 🟡 Advertencias (recomendado corregir)
- 3 colores fuera del sistema: #FF5733, #4A90E2, #50E3C2
- 2 detached instances del componente Button en la sección Hero
- Espaciado inconsistente entre cards: 23px, 24px, 26px

### 🟢 Notas (informativo)
- Faltan estados hover en links del footer
- Iconos del navbar mezclan dos librerías

### Recomendación
[Sugerir si proceder, corregir primero, o decidir caso por caso]
```
