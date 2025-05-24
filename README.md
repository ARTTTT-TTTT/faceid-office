# FaceID Office

[![Status: Development](https://img.shields.io/badge/Status-Development-yellow)](https://your-badge-url)

## ✨ Root Workspace ✨

เพื่อความสะดวกและรวดเร็ว ให้รันคำสั่งติดตั้ง dependencies ที่ **root** ของโปรเจกต์ก่อน

```bash
pnpm install
```

#### 🐳 Docker Compose Up 🐳

```bash
./scripts/generate-config.sh
```

```bash
docker compose up -d
```

## Tech Stack 🚀

| Technology | Icon                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| TypeScript | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) |
| Python     | ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)             |
| Next.js    | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)          |
| NestJS     | ![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)             |
| FastAPI    | ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)          |
| PostgreSQL | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white) |
| Redis      | ![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)                |
| LiveKit    | ![LiveKit](https://img.shields.io/badge/LiveKit-000000?style=for-the-badge&logo=livekit&logoColor=white)          |
| Coturn     | ![Coturn](https://img.shields.io/badge/Coturn-4676C8?style=for-the-badge&logo=coturn&logoColor=white)             |

## 📚 Pre-Commit 📚

- please read commitlint.config.js

## 🌿 Branch Workflow

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
