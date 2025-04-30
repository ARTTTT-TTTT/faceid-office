# Quickstart

## Project setup

```bash
pnpm install
```

## Compile and run

#### development

```bash
pnpm start
```

#### watch mode

```bash
pnpm start:watch
```

#### production mode

```bash
pnpm start:prod
```

## Delete node_modules

```bash
rm -rf node_modules pnpm-lock.yaml
```

## Pre-Commit

- please read commitlint.config.js

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
