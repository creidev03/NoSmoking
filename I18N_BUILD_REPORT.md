# i18n Build Failure Report

**Fecha:** 2026-08-16
**Rama:** feat/dashboard-restructure
**Commit problemático:** `12f83bd8` — feat(i18n): add next-intl infrastructure

---

## Síntoma

```
zsh: bus error (core dumped)  npx next build --turbopack
```

También falla con `npm run build` (webpack) y `next build` normal. El crash ocurre **durante la compilación** del build, no en runtime.

---

## Causa raíz: Rutas conflictivas en `src/app/`

El commit `12f83bd8` creó `src/app/[locale]/` con su layout y page, pero **NO movió las rutas existentes** dentro de `[locale]/`. Next.js intenta resolver rutas paralelas y entrara en un estado de crash.

### Estructura actual (conflictiva)

```
src/app/
├── (es)/                    ← route group vacío (solo tiene sign-in/sign-up duplicados)
├── es/                      ← locale hardcodeado (duplica sign-in/sign-up)
├── [locale]/                ← NUEVO del commit i18n (layout + page placeholder)
├── dashboard/               ← EXISTENTE, no está dentro de [locale]/  ⚠️
├── dashboard/logros/        ← EXISTENTE
├── dashboard/settings/      ← EXISTENTE
├── dashboard/timeline/      ← EXISTENTE
├── onboarding/              ← EXISTENTE, no está dentro de [locale]/  ⚠️
├── sign-in/                 ← EXISTENTE
├── sign-in/[[...sign-in]]/  ← EXISTENTE (Clerk)
├── sign-up/                 ← EXISTENTE
├── sign-up/[[...sign-up]]/  ← EXISTENTE (Clerk)
├── layout.tsx               ← MODIFICADO (solo fonts, thin shell)
├── page.tsx                 ← landing page
├── error.tsx
└── loading.tsx
```

### El problema específico

1. **`[locale]/` solo tiene un page.tsx placeholder** — no tiene rutas hijas (`dashboard/`, `onboarding/`, etc.)
2. **Las rutas existentes están fuera de `[locale]/`** — Next.js no sabe si debe pasarlas por el middleware de i18n o servirlas directo
3. **`(es)/` y `es/` duplican rutas** — sign-in y sign-up aparecen en 3 ubicaciones distintas
4. **Middleware intercepta todo** — el matcher `"/((?!api|_next|_vercel|.*\\..*).*)"` atrapa todas las rutas, incluyendo las que no deberían pasar por i18n

---

## Configuración actual

### `next.config.ts`
```ts
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin();
const nextConfig: NextConfig = {};
export default withNextIntl(nextConfig);  // ← envuelve toda la config
```

### `src/middleware.ts`
```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
export const middleware = createMiddleware(routing);
export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],  // ← captura TODO
};
```

### `src/i18n/routing.ts`
```ts
export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "always",  // ← siempre muestra /es/ o /en/
});
```

---

## Stack afectado

| Componente | Versión | Notas |
|---|---|---|
| Node.js | v26.4.0 | Experimental, no LTS — puede amplificar el crash |
| Next.js | 15.3.3 | Usa Turbopack por defecto en dev |
| next-intl | (instalado) | Plugin wrapper en next.config.ts |
| Clerk | @clerk/nextjs ^7.7.6 | Tiene sus propias rutas `[[...sign-in]]` |
| i18n tests | 28 tests | Todos pasan, pero no cubren build completo |

---

## Lo que necesita completar la migración i18n

1. **Mover rutas dentro de `[locale]/`:**
   - `src/app/dashboard/` → `src/app/[locale]/dashboard/`
   - `src/app/onboarding/` → `src/app/[locale]/onboarding/`
   - Las rutas de Clerk (`sign-in`, `sign-up`) pueden quedarse fuera o moverse dentro

2. **Eliminar duplicados:**
   - Borrar `src/app/(es)/` (route group vacío)
   - Borrar `src/app/es/` (duplicado hardcodeado)
   - Borrar `src/app/sign-in/` y `src/app/sign-up/` si se migran a `[locale]/`

3. **Ajustar middleware matcher:**
   - Excluir rutas de Clerk si quedan fuera de `[locale]/`
   - Excluir `onboarding` si no necesita i18n

4. **Actualizar imports:**
   - Los Server Components que usan `@/app/dashboard/actions` necesitan paths actualizados
   - Los links internos (`href="/dashboard"`) deben cambiar a `href="/es/dashboard"` o usar `useRouter` de next-intl

5. **Verificar build:**
   - `npx next build --turbopack` debe completar sin bus error
   - `npx tsc --noEmit` debe pasar sin errores

---
