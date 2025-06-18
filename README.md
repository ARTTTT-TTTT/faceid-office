# ⛶ Face ID Office

[![Status: Stable](https://img.shields.io/badge/Status-Stable-brightgreen)]()
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![Platform: Web](https://img.shields.io/badge/Platform-Web-blue)]()
[![Version](https://img.shields.io/github/v/release/ARTTTT-TTTT/faceid-office)](https://github.com/ARTTTT-TTTT/faceid-office/releases)

> 🔎 **Face ID Office** A face recognition-based attendance system for office check-in and check-out.

---

## ✨ Root Workspace ✨

เพื่อความสะดวกและรวดเร็ว ให้รันคำสั่งติดตั้ง dependencies ที่ **root** ของโปรเจกต์ก่อน

```bash
pnpm install
```

#### 🐳 Docker Compose Up 🐳

```bash
docker compose up -d
```

##### ❌ (Optional) Reset Docker ❌

```bash
docker system prune -af
```

## 🆑 (Optional) Packages 🆑

```bash
./scripts/linux/clean-packages.sh
```

---

## 🛠️ Tech Stack

| Technology | Icon                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| TypeScript | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) |
| Python     | ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)             |
| Next.js    | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)          |
| NestJS     | ![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)             |
| FastAPI    | ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)          |
| PostgreSQL | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white) |
| Redis      | ![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)                |

---

## ⚠️ License Notice

This project is **proprietary software** and **not open source**.  
All rights are reserved by the copyright holder.

You **may not** copy, modify, distribute, or use this software without explicit permission from the owner.

---

## 📚 Pre-Commit 📚

- please read commitlint.config.js

---

## 🌿 Branch Workflow 🌿

- ทุกฟีเจอร์ใหม่ ให้แตก branch จาก `dev` โดยใช้รูปแบบ:

**🌿 Feature Branch**

```bash
feature/<module>/<task-name>
```

**🛠️ Fix Branch**

```bash
fix/<module>/<description>
```

**🚑 Hotfix Branch**

```bash
hotfix/<module>/<critical-issue>
```

**🔄 Refactor Branch**

```bash
refactor/<module>/<description>
```

**⚙️ CI Branch**

```bash
ci/<system>/<task>
```

---

## 🏗️ Storage Folder Structure 🏗️

```
storage
├── [admin_id]/
│ ├── detection-images/
│ │ ├── [camera_id]
│ │ │ ├── [session_id]
│ │ │ │ ├── person-images/
│ │ │ │ │ ├── [person_id].jpg
│ │ | │ │ └── ...
│ │ │ │ └── unknown-images/
│ │ │ │   ├── [detection_log_id].jpg
│ │ │ │   └── ...
│ │ │ └── ...
│ │ └── ...
│ ├── profile-images/
│ │ ├── [person_id].jpg
│ │ └── ...
│ └── face-images/
│   ├── [person_id]/
│   │ ├── uuid1.jpg
│   │ └── ...
│   ├── [person_id]/
│   │ ├── uuid1.jpg
│   │ └── ...
│   └── ...
└── ...
```
