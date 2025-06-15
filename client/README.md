# ✨ Quickstart ✨

## 🛠️ Project setup 🛠️

```bash
pnpm install
```

## 🚀 Compile and run 🚀

#### 🧪 development

```bash
pnpm dev
```

#### 🚀 production

```bash
pnpm build
```

```bash
pnpm start
```

#### 🔎 watch

```bash
pnpm start:watch
```

## 🆑 Delete node_modules 🆑

```bash
rm -rf node_modules pnpm-lock.yaml
```

## 🧹 Clean project 🧹

```bash
pnpm lint:fix
```

## Component Logic Flow

**Router**  
 ↓  
**State**  
 ↓  
**(Callback)**  
 ↓  
**Fetch**  
 ↓  
**(Memo) / Derived**  
 ↓  
**Actions**  
 ↓  
**Effect**  
 ↓  
**Loading / (Empty Render)**  
 ↓  
**Render**
