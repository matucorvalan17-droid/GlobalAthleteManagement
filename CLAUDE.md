# CLAUDE.md — Memoria del Proyecto GlobalAthleteManagement

## Skills y Repositorios Aprendidos

### 1. obra/superpowers — Framework de Skills Agénticas
**URL:** https://github.com/obra/superpowers
**Propósito:** Metodología completa de desarrollo para agentes de codificación con habilidades componibles.

**Flujo de trabajo de 7 fases:**
1. **Brainstorming** — Refinar ideas con preguntas antes de escribir código
2. **Git Worktrees** — Crear espacios de trabajo aislados en ramas nuevas
3. **Writing Plans** — Dividir trabajo en tareas de 2-5 minutos
4. **Subagent-Driven Development** — Agentes frescos por tarea con revisión en dos etapas
5. **Test-Driven Development** — Ciclo RED-GREEN-REFACTOR obligatorio
6. **Code Review** — Revisión sistemática contra el plan
7. **Finishing Branch** — Verificar pruebas y decidir merge o PR

**Principios clave:** Pruebas primero, procesos sistemáticos, reducción de complejidad, verificación por evidencia.
**Estructura:** `skills/`, `agents/`, `commands/`, `docs/`, `tests/`, `CLAUDE.md`, `GEMINI.md`

---

### 2. affaan-m/everything-claude-code — Sistema Completo de Optimización para Claude Code
**URL:** https://github.com/affaan-m/everything-claude-code
**Propósito:** Sistema de optimización con skills, instincts, memory, security y research-first development. Ganador del hackathon de Anthropic (173,000 stars).

**Componentes principales:**
- **48 Agentes especializados** — Planificación, revisión de código, resolución de errores, análisis de seguridad
- **182 Skills (flujos de trabajo)** — Patrones backend/frontend, testing, aprendizaje continuo
- **34 Rules** — Directrices por lenguaje: `common/`, `typescript/`, `python/`, `golang/`, `swift/`, `php/`
- **68 Commands** — Interfaz slash: `/plan`, `/code-review`, `/build-fix`
- **Hooks** — Automatización en SessionStart, edición de archivos, compilación
- **MCP Configs** — GitHub, Supabase, Vercel, Playwright, Context7

**Herramientas del ecosistema:**
- **AgentShield**: Auditor de seguridad con 102 reglas estáticas
- **Skill Creator**: Genera capacidades desde historial Git
- **Dashboard GUI**: Interfaz Tkinter con temas oscuro/claro

Soporta 12 ecosistemas de lenguaje, funciona en Windows/macOS/Linux.

---

### 3. thedotmack/claude-mem — Memoria Persistente para Claude Code
**URL:** https://github.com/thedotmack/claude-mem
**Propósito:** Plugin que implementa compresión de memoria persistente — captura automáticamente lo que Claude hace, lo comprime con IA y reinyecta contexto relevante en futuras sesiones.

**Arquitectura técnica:**
- **5 Hooks de ciclo de vida:** SessionStart, UserPromptSubmit, PostToolUse, Stop, SessionEnd
- **Worker Service:** API HTTP en puerto 37777 con interfaz web
- **SQLite:** Almacena sesiones, observaciones y resúmenes
- **Chroma Vector DB:** Búsqueda híbrida semántica y por palabras clave
- **Skill `mem-search`:** Consultas en lenguaje natural (~10x más eficiente en tokens)

**Herramientas MCP:** Patrón de 3 capas — búsqueda compacta → contexto cronológico → detalles completos.
**Requisitos:** Node.js 18+, Claude Code con plugins, Bun, SQLite 3, uv (Python).
**Licencia:** AGPL-3.0

---

### 4. nextlevelbuilder/ui-ux-pro-max-skill — Inteligencia de Diseño UI/UX
**URL:** https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
**Propósito:** Skill de IA que genera sistemas de diseño completos automáticamente basados en requisitos de proyecto.

**Recursos incluidos:**
- **67 estilos UI** — Minimalismo, Brutalism y más
- **161 paletas de colores** específicas por industria
- **57 combinaciones tipográficas**
- **161 reglas de razonamiento** para diferentes tipos de producto

**Estructura:** `src/ui-ux-pro-max/` (datos, scripts, plantillas), `cli/` (instalador), `scripts/` (motor de búsqueda), `data/` (CSV con estilos y colores).

**Integración:** Claude Code, Cursor, Windsurf, GitHub Copilot y otros. Se activa automáticamente al solicitar trabajo UI/UX o con comandos slash.
**Distribución:** CLI `uipro-cli` o integración directa en plataformas de IA.

---

### 5. czlonkowski/n8n-mcp — Servidor MCP para Automatización n8n
**URL:** https://github.com/czlonkowski/n8n-mcp
**Propósito:** Servidor Model Context Protocol que conecta asistentes IA con n8n para construir flujos de automatización con 1,650 nodos disponibles. (19.8k stars, MIT)

**7 Herramientas MCP centrales:**
- `search_nodes` — Búsqueda de nodos con filtros
- `get_node` — Info detallada (modos: minimal, standard, full, docs)
- `validate_node` — Validación rápida o exhaustiva
- `search_templates` — Descubrimiento de templates por keyword/nodos/tareas
- `get_template` — Recuperación de workflows completos
- `validate_workflow` — Validación integral de flujos
- `tools_documentation` — Referencia de herramientas

**13 Herramientas de gestión n8n** (requieren `N8N_API_URL` y `N8N_API_KEY`):
- Gestión de flujos: crear, obtener, actualizar (completo/parcial), eliminar, listar, validar
- Ejecución: pruebas, listado con filtros
- Credenciales: crear, actualizar, eliminar, obtener esquemas

**Cobertura:** 99% propiedades de nodos, 87% documentación oficial.
**Nota de seguridad:** NUNCA editar workflows de producción directamente con IA.
**Stack:** TypeScript (91.8%), JavaScript (6.7%)
