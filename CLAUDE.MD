# Contexto del Proyecto: "AsíDeSimple AI"
Somos una plataforma web desarrollada con React (Vite) y React Router en el frontend. Nuestro objetivo actual es implementar las Prácticas 9 y 10: Un sistema de Autenticación y Autorización Basado en Roles (RBAC) seguro.

## Stack Tecnológico Requerido
*   **Frontend:** React, React Router Dom.
*   **Backend:** Node.js, Express.js, CORS.
*   **Base de Datos & ORM:** SQLite + Prisma ORM.
*   **Seguridad:** bcryptjs (hash de contraseñas), jsonwebtoken (sesiones JWT).

## Objetivos del Asistente (Cloud Code / Gemini)
Debes ayudarme a codificar e implementar paso a paso lo siguiente, proporcionando los comandos de terminal y el código fuente:

### 1. Inicialización del Backend y Prisma
*   Crear una carpeta `server` en la raíz del proyecto.
*   Inicializar un proyecto Node.js e instalar dependencias (`express`, `cors`, `bcryptjs`, `jsonwebtoken`, `prisma`, `@prisma/client`).
*   Inicializar Prisma con SQLite (`npx prisma init --datasource-provider sqlite`).

### 2. Diseño del Prisma Schema (schema.prisma)
Necesito que me generes el esquema de Prisma con las siguientes 5 tablas para cumplir la rúbrica de RBAC:
1.  `Usuario` (id, nombre, email, password).
2.  `Rol` (id, nombre) -> Roles obligatorios: Administrador, Editor, Usuario.
3.  `Permiso` (id, nombre).
4.  `UsuarioRol` (Relación muchos a muchos entre Usuario y Rol).
5.  `RolPermiso` (Relación muchos a muchos entre Rol y Permiso).

### 3. API de Express (server/index.js)
Crear un servidor Express corriendo en el puerto 3001 con los siguientes endpoints:
*   `POST /api/auth/registro`: Recibe nombre, email y password. Hashea el password con bcrypt y guarda al usuario asignándole el rol de "Usuario" por defecto usando Prisma.
*   `POST /api/auth/login`: Valida credenciales con bcrypt. Si es exitoso, devuelve un JWT firmado que incluya el ID del usuario y sus roles.

### 4. Integración Frontend (React)
*   Crear un componente `ProtectedRoute.jsx` que lea el JWT del `localStorage`, valide si existe la sesión y si el rol del usuario coincide con los roles permitidos. Si no, redirigir a `/login`.
*   Actualizar `App.jsx` para incluir este componente enrutando a una nueva vista protegida llamada `/dashboard`.

Por favor, sé directo, proporciona el código completo de los archivos clave (`schema.prisma`, `index.js`, `ProtectedRoute.jsx`) y los comandos exactos para ejecutar las migraciones de Prisma.

