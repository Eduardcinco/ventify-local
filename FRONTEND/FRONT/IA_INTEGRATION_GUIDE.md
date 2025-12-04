# 🤖 Integración de IA en Ventify - GUÍA COMPLETA

## ✅ Archivos Creados

### 1. **ai.service.ts** - Servicio de IA
`src/app/services/ai.service.ts`

**Métodos disponibles:**
- `chat(messages)` - Chat completo con historial
- `preguntaRapida(question)` - Pregunta simple
- `generarPost(productoId, plataforma)` - Genera copys para redes

### 2. **ai-chat-float.component** - Chat Flotante
Componente visual con:
- ✅ Botón flotante morado inferior derecha
- ✅ Panel de chat desplegable
- ✅ Historial de conversación
- ✅ Animaciones suaves
- ✅ Auto-scroll
- ✅ Botón limpiar chat

### 3. **Integración en app.component**
El chat flotante está disponible en TODAS las páginas del sistema.

### 4. **Botón "Crear Post" en productos**
Agregado en `product-form.component`:
- ✅ Botón morado con ícono de IA
- ✅ Solo visible en modo edición
- ✅ Modal con 3 versiones de copy
- ✅ Botón "Copiar" para cada versión
- ✅ Estilos profesionales

---

## 🚀 Cómo Usar

### Chat Flotante (Todas las páginas)
1. Busca el botón morado con ícono de robot en la esquina inferior derecha
2. Haz clic para abrir el panel de chat
3. Escribe tu pregunta sobre Ventify
4. Presiona Enter o el botón Enviar
5. ¡La IA responde en ~1 segundo!

**Ejemplos de preguntas:**
- "¿Cómo registro una venta?"
- "¿Cómo agrego un producto?"
- "¿Cómo veo el reporte de ventas del mes?"
- "¿Cómo registro una merma?"
- "¿Qué permisos tiene un cajero?"

### Generar Posts para Productos
1. Ve a **Dashboard → Inventario**
2. Haz clic en **Editar** en cualquier producto
3. En el formulario, busca el botón **"Crear Post con IA"** (morado)
4. Haz clic y espera ~2 segundos
5. Se abre un modal con 3 versiones de copy
6. Haz clic en **"Copiar"** en la que te guste
7. ¡Pégala en tu red social!

**Nota:** El producto DEBE estar guardado primero (debe estar en modo edición).

---

## 🔧 Endpoints del Backend

### POST /api/ai/chat
```json
// Request
{
  "messages": [
    { "role": "user", "content": "¿Cómo registro una venta?" }
  ]
}

// Response
{
  "message": "Para registrar una venta en Ventify..."
}
```

### POST /api/ai/post-producto
```json
// Request
{
  "productoId": 123,
  "plataforma": "instagram" // o "facebook", "tiktok", "todas"
}

// Response
{
  "copies": "🔥 ¡Nuevo producto disponible!\n\n..."
}
```

---

## 🎨 Características Visuales

### Chat Flotante
- **Color:** Morado degradado (#8b5cf6 → #7c3aed)
- **Posición:** Fixed, bottom-right (24px)
- **Tamaño:** 380px × 550px (panel)
- **Animaciones:** Fade in/out, scale, typing dots
- **Responsive:** Se adapta a móviles

### Botón "Crear Post"
- **Color:** Mismo morado de chat
- **Ícono:** Robot SVG
- **Estados:** Normal, hover, disabled, loading
- **Modal:** 800px max-width, overlay con blur

---

## 🔒 Seguridad

✅ **API Key protegida** - Solo el backend tiene acceso  
✅ **JWT obligatorio** - AuthInterceptor añade automáticamente  
✅ **Contexto por negocio** - Cada usuario ve solo su info  
✅ **Prompts restrictivos** - IA solo responde sobre Ventify  

---

## 🐛 Solución de Problemas

### El chat no aparece
- ✅ Verifica que estés logueado
- ✅ Recarga la página (F5)
- ✅ Revisa la consola del navegador (F12)

### Error al generar posts
- ✅ Asegúrate de estar en modo EDICIÓN (no creación)
- ✅ Verifica que el backend esté corriendo (puerto 5129)
- ✅ Revisa que `OPENROUTER_API_KEY` esté en el backend

### "Error al cargar el reporte"
- ✅ Verifica la conexión al backend
- ✅ Revisa que el token JWT sea válido
- ✅ Consulta logs del backend

---

## 📝 Próximas Mejoras (Opcional)

1. **Sugerencias automáticas** - "¿Te ayudo con...?"
2. **Comandos rápidos** - "/venta", "/producto", "/reporte"
3. **Copys para categorías** - No solo productos individuales
4. **Historial de chats** - Guardar conversaciones
5. **Exportar copys** - Botón para descargar como .txt

---

## 🎯 Resumen Ejecutivo

| Componente | Estado | Tiempo prueba |
|------------|--------|---------------|
| ai.service.ts | ✅ Listo | - |
| Chat flotante | ✅ Listo | 30 seg |
| Botón "Crear Post" | ✅ Listo | 1 min |
| Backend endpoints | ✅ Listo | - |

**Total:** ¡Todo funcional en ~2 minutos de pruebas!

---

## 🚦 Checklist de Pruebas

- [ ] Login → Ver botón morado inferior derecha
- [ ] Clic en botón → Panel se abre
- [ ] Preguntar "¿Cómo registro una venta?" → Respuesta OK
- [ ] Ir a editar producto → Ver botón "Crear Post"
- [ ] Clic "Crear Post" → Modal con 3 copys
- [ ] Clic "Copiar" → Texto en portapapeles
- [ ] Cerrar modal → Vuelve a formulario

---

**Desarrollado con 💜 por el equipo Ventify**  
*Powered by OpenRouter + Claude Sonnet 3.5*
