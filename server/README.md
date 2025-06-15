# ✨ Quickstart ✨

## 🛠️ Project setup 🛠️

```bash
pnpm install
```

## 🛢️ Prisma 🛢️

### 💾 Prisma Migrate Dev (Development) 💾

```bash
pnpm prisma migrate dev
```

### 💾 (Optional) If you don't want to keep the migration history 💾

```bash
pnpm prisma db push
```

### ☁️ Prisma Migrate Deploy (Production) ☁️

```bash
pnpm prisma migrate Deploy
```

### ⚙️ Prisma Generate ⚙️

```bash
pnpm prisma generate
```

### ⚡Apply SQL Code ⚡

- `Linux`

```bash
./prisma/apply-sql.sh
```

- `Windows`

```bash
powershell.exe -ExecutionPolicy Bypass -File "prisma\apply-sql.ps1"
```

---

### 🚀 Prisma Studio 🚀

```bash
pnpm prisma studio
```

#### (OPTIONAL) ❌ Delete Prisma migration and reset Database ❌

```bash
rm -rf prisma/migrations
pnpm prisma migrate reset
```

## 🚀 Compile and run 🚀

### 🧪 development

```bash
pnpm dev
```

### 🚀 production

```bash
pnpm build
```

```bash
pnpm start
```

### 🔎 debug

```bash
pnpm start:debug
```

### 🏗️ NestJS Generate 🏗️

- #### Resource

```bash
pnpm nest generate resource [name]
```

- #### Service

```bash
pnpm nest generate service [name]
```

- #### Controller

```bash
pnpm nest generate controller [name]
```

- #### Module

```bash
pnpm nest generate module [name]
```

## 🧹 Clean project 🧹

```bash
pnpm lint:fix
```

## ❌ Error Exception ❌

- `NotFoundException`: ดึงข้อมูลด้วย ID แล้วไม่เจอ, พยายามอัปเดตหรือลบข้อมูลที่ไม่มีอยู่

- `BadRequestException` Validation ข้อมูลไม่ผ่าน, Parameter ใน Query หรือ Body ไม่ถูกต้อง

- `UnauthorizedException` ไม่ได้ส่ง Token, Token ไม่ถูกต้อง, พยายามเข้าถึง Endpoint ที่ต้อง Login

- `ForbiddenException` พยายามเข้าถึง Endpoint หรือดำเนินการบางอย่างโดยที่ Role หรือสิทธิ์ไม่เพียงพอ

- `InternalServerErrorException` เกิด Error ใน Logic ของ Application, ปัญหาในการเชื่อมต่อ Database (ในกรณีที่ไม่สามารถระบุ Exception ที่เฉพาะเจาะจงกว่าได้)

## 🆑 Delete node_modules 🆑

```bash
rm -rf node_modules pnpm-lock.yaml
```
