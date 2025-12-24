# Project Overview
**Trackify** is a real-time web dashboard for monitoring a smart warehouse system utilizing **4-way Shuttle** and **Lifter** technology.
It provides a high-fidelity 3D visualization of the warehouse layout and real-time tracking of equipment and tasks.

# Tech Stack
## Frontend
* **Framework:** React.js (Vite)
* **Visualization:** Three.js + React Three Fiber (R3F)
* **State Management:** Zustand
* **UI:** Ant Design, Tailwind CSS
* **Language:** JavaScript/JSX

## Backend
* **Runtime:** .NET 8 (C#)
* **Architecture:** Clean Architecture (Domain, Application, Infrastructure, API)
* **Orchestration:** .NET Aspire
* **Communication:** S7NetPlus (PLC), SignalR (Real-time)
* **Database:** Redis (Cache), PostgreSQL (Persistence)

# Project Structure
* `backend/`: .NET Solution
    * `src/Trackify.AppHost/`: Aspire Orchestrator
    * `src/Trackify.API/`: Web API & SignalR Hubs
    * `src/Trackify.Domain/`: Entities & Core Logic
    * `src/Trackify.Application/`: Use Cases & DTOs
    * `src/Trackify.Infrastructure/`: Data Access & External Services
* `frontend/`: React Application
    * `src/features/dashboard/`: 3D Scene Logic
    * `src/store/`: Zustand Stores
