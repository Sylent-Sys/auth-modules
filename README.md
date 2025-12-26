# Sylent Auth Modules

**Centralized Authentication System with Project-Scoped SSO, RBAC, and Isomorphic SDK.**

Proyek ini adalah solusi autentikasi lengkap yang dirancang untuk performa tinggi dan keamanan modern. Terdiri dari Backend (Bun + ElysiaJS), Frontend Dashboard (React + Vite), dan SDK TypeScript isomorfik untuk integrasi mudah.

## 🚀 Fitur Utama

* **High Performance:** Backend dibangun di atas **Bun** runtime dan framework **ElysiaJS**.
* **Keamanan Terjamin:**
    * Password hashing menggunakan **Argon2id** (standar pemenang kompetisi hashing password).
    * Token JWT ditandatangani secara asimetris menggunakan **RS256** (Public/Private Key).
* **Project-Scoped SSO:** Satu akun user bisa memiliki akses dan role berbeda di berbagai proyek (tenant) yang berbeda.
* **RBAC (Role-Based Access Control):** Manajemen hak akses yang fleksibel per proyek.
* **Isomorphic SDK:** SDK siap pakai yang berjalan mulus di Browser (React/Vue) dan Server (Node/Bun/Deno).
* **Audit Logging:** Mencatat setiap aktivitas penting untuk keperluan keamanan dan debugging.

## 🛠️ Tech Stack

| Komponen | Teknologi |
| :--- | :--- |
| **Backend** | [Bun](https://bun.sh), [ElysiaJS](https://elysiajs.com), MySQL 8.4, Zod |
| **Frontend** | React, TypeScript, Vite, TailwindCSS (via styling), Nginx |
| **SDK** | TypeScript, Native Fetch (No dependencies) |
| **DevOps** | Docker, Docker Compose |

## 📂 Struktur Proyek

```bash
.
├── backend/          # API Server (ElysiaJS + Bun)
│   ├── src/modules/  # Modular architecture (Auth, Users, Projects, etc.)
│   └── migrations/   # Database migrations & seeds
├── frontend/         # Admin Dashboard (React + Vite)
├── auth-modules-sdk/ # Universal TypeScript Client Library
└── docker-compose.yml # Orkestrasi seluruh service

## 📄 License

Copyright (C) 2025 Renaldi Apriyanto Kadang

This project is licensed under the **GNU Affero General Public License v3.0 (AGPLv3)**.

You are free to use, modify, and distribute this software, but **if you run a modified version of this software over a network (e.g., as a SaaS backend), you MUST make the full source code of your modified version available to the users of that service.**

See the [LICENSE](LICENSE) file for details.