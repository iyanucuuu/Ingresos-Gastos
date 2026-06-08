# Ingresos Gastos

Aplicación web para el control de finanzas personales: registra ingresos, gastos e inversiones, organízalos por categorías y visualiza tu balance con gráficos e históricos.

## Stack tecnológico

- **Frontend:** Angular 17, Chart.js / ng2-charts
- **Backend:** Spring Boot (Java 17), Spring Data JPA, Spring Validation
- **Base de datos:** PostgreSQL (Supabase)

## Estructura del proyecto

```
Ingresos_Gastos/
├── frontend/   # Aplicación Angular
├── backend/    # API REST en Spring Boot
└── iniciar.bat / iniciar.ps1   # Scripts para arrancar frontend y backend a la vez
```

El frontend incluye módulos para calendario, categorías, gastos, ingresos, inversiones, histórico, resumen y perfil de usuario.

## Puesta en marcha

### Requisitos

- Node.js y npm
- JDK 17
- Maven
- Una base de datos PostgreSQL (puede usarse Supabase; ver `backend/supabase_migration.sql` para crear el esquema)

### Backend

```bash
cd backend
mvn spring-boot:run
```

El servidor arranca en `http://localhost:8080`.

### Frontend

```bash
cd frontend
npm install
npm start
```

La aplicación queda disponible en `http://localhost:4200`.

### Arranque rápido (Windows)

El script `iniciar.bat` (o `iniciar.ps1`) lanza backend y frontend a la vez desde la raíz del proyecto.

## Autor

Iyán Gironés Suárez
