# ✨ Quickstart ✨

## 🛠️ Project setup 🛠️

```bash
pnpm install
```

### ⚙️ Prisma Generate ⚙️

```bash
pnpm prisma generate
```

### 💾 Prisma Migrate Dev (Initial Migration) 💾

```bash
pnpm prisma migrate dev --name "dev"
```

### 🛢 Prisma Studio 🛢

```bash
pnpm studio
```

## 🚀 Compile and run 🚀

### 🧪 development

```bash
pnpm dev
```

```bash
pnpm start
```

### 🔎 debug

```bash
pnpm start:debug
```

### 🚀 production

```bash
pnpm start:prod
```

### 🏗️ NestJS Generate 🏗️

- #### Resource

```bash
pnpm generate [name]
```

- #### Service

```bash
pnpm generate:service [name]
```

- #### Controller

```bash
pnpm generate:controller [name]
```

- #### Module

```bash
pnpm generate:module [name]
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

"""
storage
├── [admin_id]/
│ ├── detected-images/
│ │ ├── [camera_id]
| │ │ ├── [session_id]
| | │ | ├── person-images/
| │ │ | | ├── [person_id].jpg
│ │ | | | └── ...
| | │ | ├── person-images/
| │ │ | | ├── uuid1.jpg
│ │ | | | └── ...
│ │ | └── ...
│ │ └── ...
│ ├── profile-images/
│ │ ├── [person_id].jpg
│ │ └── ...
│ ├── face-images/
│ │ ├── [person_id]/
| │ │ ├── uuid1.jpg
| │ │ ├── uuid2.jpg
| │ │ └── uuid3.jpg
| │ ├── [person_id]/
| │ │ ├── uuid1.jpg
| │ │ ├── uuid2.jpg
| │ │ └── uuid3.jpg
| │ └── ...
└── ...
"""
