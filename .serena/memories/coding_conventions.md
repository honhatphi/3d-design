# Coding Conventions

## General
* **Language:** English only.
* **Principles:** DRY, KISS.

## Frontend
* **Structure:** Feature-based grouping (`src/features/`).
* **Naming:** PascalCase for Components, camelCase for Hooks, UPPER_SNAKE_CASE for Constants.
* **Three.js:** Avoid object allocation in `useFrame`. Use `InstancedMesh` for repeating items. Dispose geometries/materials.

## Backend
* **Async/Await:** Use for all I/O.
* **Pattern:** Repository/Service pattern. Thin controllers.
* **PLC:** Wrap Read/Write in try-catch. Read full Data Blocks. Map to DTOs.
* **Naming:** PascalCase for Classes/Methods, camelCase for local variables, 'I' prefix for Interfaces.
