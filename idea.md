# IDEA — Plataforma de Presentación de Proyectos de Software

## Nombre tentativo
**DevProposal Hub** — Plataforma colaborativa para propuesta, evaluación y seguimiento de proyectos de desarrollo de software.

## Problema que resuelve
Los equipos de desarrollo carecen de un canal estructurado para proponer ideas de software. Las propuestas llegan por correo, mensajería informal o presentaciones inconsistentes, lo que dificulta evaluarlas con criterios homogéneos y tomar decisiones bien fundamentadas sobre su viabilidad.

## Solución propuesta
Una aplicación web que funciona como guía interactiva y formulario estructurado para que cualquier miembro del equipo pueda redactar y presentar una propuesta de proyecto siguiendo un estándar definido. Las propuestas se almacenan en MongoDB y pueden ser consultadas, evaluadas y filtradas por líderes y tomadores de decisión.

## Propuesta de valor
- **Para proponentes:** Un asistente paso a paso que les enseña a estructurar bien una idea antes de presentarla.
- **Para evaluadores:** Un panel centralizado con todas las propuestas estandarizadas, con criterios de scoring y filtros.
- **Para la organización:** Un histórico consultable de proyectos propuestos, aprobados, rechazados o en revisión.

## Usuarios objetivo
| Rol | Descripción |
|-----|-------------|
| **Proponente** | Cualquier miembro del equipo que quiere presentar un proyecto |
| **Evaluador** | Tech lead, product owner o comité que revisa y valora propuestas |
| **Administrador** | Gestiona usuarios, estados y configuración del sistema |

## Diferenciadores clave
- Guía educativa embebida (tooltips, ejemplos, buenas prácticas) en cada campo del formulario
- Score de viabilidad automático basado en criterios configurables
- Exportación a PDF/Excel para presentaciones formales
- Dashboard con métricas y estado de propuestas en tiempo real
- Interfaz moderna, dark/light mode, completamente responsiva

## Alcance inicial (MVP)
1. Formulario guiado multi-paso para crear propuestas
2. Almacenamiento en MongoDB Atlas
3. Panel de visualización de propuestas con filtros
4. Sistema de evaluación con criterios predefinidos
5. Exportación básica a PDF

## Alcance futuro (post-MVP)
- Notificaciones por correo al cambiar estado
- Comentarios y votaciones en propuestas
- Integración con Jira/Trello para proyectos aprobados
- IA para sugerir mejoras a la propuesta
- Autenticación y roles avanzados

## Stack tecnológico propuesto
- **Frontend:** HTML5, CSS3 (variables + grid + flexbox), JavaScript vanilla (ES2022+)
- **Backend:** Node.js + Express
- **Base de datos:** MongoDB Atlas (Mongoose ODM)
- **Deployment:** VPS propio o Railway/Render (gratuito para MVP)

## Supuestos y restricciones
- El MVP no requiere autenticación compleja (se puede empezar con un código de acceso simple)
- Los datos deben ser exportables en cualquier momento
- La guía de redacción debe funcionar sin necesidad de registro previo
