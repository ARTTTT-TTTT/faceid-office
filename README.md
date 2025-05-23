# FaceID Office

[![Status: Development](https://img.shields.io/badge/Status-Development-yellow)](https://your-badge-url)

## ✨ Root Workspace ✨

เพื่อความสะดวกและรวดเร็ว ให้รันคำสั่งติดตั้ง dependencies ที่ **root** ของโปรเจกต์ก่อน

```bash
pnpm install
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

## 📚 Pre-Commit 📚

- please read commitlint.config.js

## 🌿 Branch Workflow

- ทุกฟีเจอร์ใหม่ ให้แตก branch จาก `dev` โดยใช้รูปแบบ:

**🌿 Feature**

```bash
feature/<module>/<task-name>
```

**ตัวอย่าง:**

- `feature/ai/api-auth`
- `feature/server/session-storage`
- `feature/client/navbar`

---

**🛠️ Fix Branch**

```bash
fix/<module>/<description>
```

**ตัวอย่าง:**

- `fix/server/login-token`
- `fix/client/form-validation`

---

**🚑 Hotfix Branch**

```bash
hotfix/<module>/<critical-issue>
```

**ตัวอย่าง:**

- `hotfix/main/crash-on-login`
- `hotfix/server/invalid-response-500`

---

**🔄 Refactor Branch**

```bash
refactor/<module>/<description>
```

**ตัวอย่าง:**

- `refactor/ai/clean-face-detection-logic`
- `refactor/server/optimize-db-query`

---

**⚙️ CI Branch**

```bash
ci/<system>/<task>
```

**ตัวอย่าง:**

- `ci/github/setup-actions`
- `ci/dockerfile/update-base-image`
