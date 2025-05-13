# ✨ Quickstart ✨

## 🛠️ Project setup 🛠️

```bash
pnpm install
```

## 🚀 Compile and run 🚀

#### 🧪 development

```bash
pnpm start
```

#### 🔎 watch

```bash
pnpm start:watch
```

#### 🚀 production

```bash
pnpm start:prod
```

## 🆑 Delete node_modules 🆑

```bash
rm -rf node_modules pnpm-lock.yaml
```

## 🧹 Clean project 🧹

```bash
pnpm lint:fix
```

## 📚 Pre-Commit 📚

- please read commitlint.config.js

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
