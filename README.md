# 💈 Barber Ves - Sistema de Control Interno

Un sistema web integral desarrollado bajo la arquitectura MVC para administrar de manera eficiente los procesos operativos y financieros de una barbería. Diseñado con un enfoque estricto en ciberseguridad, automatización de reglas de negocio y una interfaz de usuario fluida.

Este proyecto fue construido como una solución Full Stack para optimizar la gestión de caja, el flujo de atención y el control de inventario, implementando autenticación JWT y control de accesos por roles.

---

## 🌐 Acceso al Sistema (Despliegue en Vivo)

El frontend de esta aplicación se encuentra desplegado y optimizado para producción a través de Vercel. Puedes acceder al sistema completo desde cualquier navegador sin necesidad de instalación local:

🔗 **Enlace del proyecto:**  <a href="https://barberves-deko451s-projects.vercel.app" target="_blank">https://barberves-deko451s-projects.vercel.app</a>

---

## ✨ Características Principales

* **🔐 Autenticación y Seguridad:** Login seguro con encriptación BCrypt y manejo de sesiones mediante tokens JWT. Control de acceso estricto basado en roles (Administrador y Barbero).
* **📦 Motor de Inventario Inteligente:** Descuento automático de stock al finalizar cada servicio/transacción y sistema de alertas para productos con bajo stock (umbral <= 10).
* **💰 Gestión de Caja:** Control de ingresos en tiempo real clasificados por método de pago (Efectivo, Yape, Plin).
* **📊 Reportes Dinámicos:** Generación y exportación de cierres de caja en formato Excel (`.xlsx`) en tiempo real.
* **✉️ Recuperación de Accesos:** Flujo seguro de recuperación de contraseñas de 2 pasos con envío automático de PIN de seguridad vía correo electrónico (SMTP).

---

## 🛠️ Stack Tecnológico

### Frontend (Interfaz de Usuario)
* React.js + Vite (Entorno de desarrollo ultra rápido)
* Despliegue en Vercel
* Diseño UI/UX responsivo (Dark/Gold theme)

### Backend (Lógica y Servidor)
* Java + Spring Boot (Arquitectura API REST)
* Spring Security + JJWT (Gestión de roles y tokens)
* **Apache POI:** Generación de reportes financieros en Excel.
* **Apache Commons Email:** Conexión SMTP y envío de correos.
* **Logback:** Trazabilidad y auditoría de eventos en consola.

### Base de Datos
* PostgreSQL (Alojada en la nube mediante Supabase)
* Spring Data JPA + Hibernate (ORM)

---

## 🔐 Credenciales de Prueba

El sistema cuenta con datos precargados para facilitar su evaluación técnica y revisión de interfaces sin necesidad de crear cuentas nuevas.

**👑 Administrador**
*(Acceso total: Dashboard financiero, gestión de personal, inventario global, reportes Excel).*
* **Correo:** `admin@barberia.com`
* **Contraseña:** `admin123`

**✂️ Barbero**
*(Acceso limitado: Visualización de cola de clientes asignada, registro de servicios propios).*
* **Correo:** `miguel@barberia.com`
* **Contraseña:** `Miguel123`

---
