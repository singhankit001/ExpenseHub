# Frontend Developer Guide

> **ExpenseFlow** — Frontend architecture, patterns, and contribution guide  
> Stack: React 19 · TypeScript · Vite · Tailwind CSS v4 · TanStack Query · Framer Motion

---

## Getting Started

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
npm run preview    # preview production build locally
```

---

## Project Structure

```
frontend/src/
├── main.tsx                   # Root component — providers tree
├── index.css                  # Global styles + Tailwind @theme tokens
├── types/
│   └── index.ts               # All shared TypeScript interfaces
├── services/
│   ├── api.ts                 # Axios instance with interceptors
│   └── auth.service.ts        # Typed auth API calls
├── hooks/
│   └── useAuth.tsx            # Auth context, state, and actions
├── routes/
│   └── index.tsx              # React Router v6 route tree
├── layouts/
│   ├── AppLayout.tsx          # Authenticated shell
│   └── AuthLayout.tsx         # Unauthenticated split-panel shell
├── pages/                     # One file per route
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── ExpensesPage.tsx
│   └── ...
└── components/
    ├── ui/                    # Generic, reusable UI primitives
    │   ├── input.tsx
    │   ├── button.tsx
    │   ├── card.tsx
    │   ├── modal.tsx
    │   ├── background.tsx
    │   └── EmptyState.tsx
    └── dashboard/             # Domain-specific dashboard components
        ├── HealthScore.tsx
        ├── InsightCard.tsx
        └── Sparkline.tsx
```

---

## Design System

### Color Tokens

All colors are defined as CSS custom properties in `index.css` using the Tailwind v4 `@theme` block:

```css
@theme {
  /* Brand palette — oklch for perceptual uniformity */
  --color-brand-500: oklch(0.48 0.20 264);   /* Primary blue-indigo */
  --color-brand-600: oklch(0.42 0.20 264);   /* Hover state */

  /* Surface scale — dark charcoal neutrals */
  --color-surface-50:  oklch(0.14 0.015 264); /* Page background */
  --color-surface-100: oklch(0.18 0.02 264);  /* Card/container bg */
  --color-surface-200: oklch(0.24 0.025 264); /* Borders */
  --color-surface-600: oklch(0.70 0.015 264); /* Secondary text */
  --color-surface-900: oklch(0.96 0.005 264); /* Primary text */

  /* Accent colors */
  --color-accent-emerald: oklch(0.72 0.18 145);
  --color-accent-violet:  oklch(0.60 0.20 300);
  --color-accent-gold:    oklch(0.76 0.16 75);
}
```

### Typography

The app uses the **Outfit** typeface loaded from Google Fonts, with **Inter** as fallback:

```css
@theme {
  --font-sans: 'Outfit', 'Inter', system-ui, -apple-system, sans-serif;
}
```

### Utility Classes

| Class | Purpose |
|-------|---------|
| `.glass-card` | Glassmorphic card with backdrop-filter blur |
| `.gradient-text-primary` | White-to-grey gradient text |
| `.gradient-text-accent` | Blue-violet-emerald gradient text |
| `.animate-in` | Entrance fade + slide animation |
| `.animate-pulse-slow` | Slow pulse for ambient background elements |
| `.animate-float` | Gentle float animation for decorative elements |
| `.glow-purple`, `.glow-emerald`, `.glow-blue` | Colored glow shadows |

---

## Component Library

### `<Input />`

Dark-themed form input with optional password show/hide toggle.

```tsx
import { Input } from '@/components/ui/input';

// Basic text input
<Input
  label="Email"
  id="email"
  type="email"
  placeholder="you@example.com"
  error={errors.email?.message}
  {...register('email')}
/>

// Password input (auto adds show/hide toggle)
<Input
  label="Password"
  id="password"
  type="password"
  {...register('password')}
/>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `label` | string | Field label text |
| `error` | string | Validation error message (renders red) |
| `helperText` | string | Helper text below input |
| All HTML input props | — | Forwarded to native `<input>` |

---

### `<Button />`

Multi-variant button with loading state and icon support.

```tsx
import { Button } from '@/components/ui/button';

<Button variant="primary" size="lg" isLoading={isPending}>
  Submit
</Button>

<Button variant="outline" leftIcon={<Plus className="w-4 h-4" />}>
  Add Expense
</Button>
```

**Variants:** `primary` | `secondary` | `outline` | `ghost` | `danger`  
**Sizes:** `sm` | `md` | `lg`

---

### `<Modal />`

Animated portal modal with backdrop and spring transition.

```tsx
import { Modal } from '@/components/ui/modal';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Add New Expense"
  footer={
    <>
      <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button type="submit" variant="primary">Save</Button>
    </>
  }
>
  {/* form content */}
</Modal>
```

---

### `<EmptyState />`

Displays when a list has no items.

```tsx
import { EmptyState } from '@/components/ui/EmptyState';

<EmptyState
  icon={<Receipt className="w-8 h-8" />}
  title="No expenses yet"
  description="Add your first expense to start tracking your spending."
  action={<Button onClick={openAddModal}>Add Expense</Button>}
/>
```

---

### `<BackgroundSystem />`

Renders the ambient animated mesh gradient background. Place once per layout:

```tsx
import { BackgroundSystem } from '@/components/ui/background';

// In layout component
<div className="min-h-screen relative">
  <BackgroundSystem />
  {children}
</div>
```

---

## State Management Patterns

### Server State (TanStack Query)

All API data is managed through TanStack Query. The pattern is:

```tsx
// Fetching data
const { data, isLoading, isError } = useQuery({
  queryKey: ['expenses', filters],
  queryFn: () => expenseService.getAll(filters).then(r => r.data.data),
  staleTime: 60_000,
});

// Mutating data
const mutation = useMutation({
  mutationFn: (data) => expenseService.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    toast.success('Expense added!');
  },
  onError: (error) => {
    toast.error(error.response?.data?.message || 'Something went wrong');
  },
});
```

### Auth State (React Context)

Auth state is managed in `useAuth()`:

```tsx
import { useAuth } from '@/hooks/useAuth';

const { user, isAuthenticated, isLoading, login, logout } = useAuth();
```

---

## Forms with React Hook Form + Zod

All forms use `react-hook-form` with Zod schema validation:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  amount: z.coerce.number().positive('Amount must be positive'),
  category: z.enum(['Food', 'Travel', 'Bills', ...]),
});

type FormValues = z.infer<typeof schema>;

const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: { category: 'Food' },
});

<form onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
  <Input
    label="Title"
    error={form.formState.errors.title?.message}
    {...form.register('title')}
  />
</form>
```

---

## Animations with Framer Motion

Use Framer Motion for entrance animations and interactions:

```tsx
import { motion } from 'framer-motion';

// Page entrance
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
>
  {content}
</motion.div>

// Hover scale on cards
<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
  <Card>...</Card>
</motion.div>
```

---

## Adding a New Page

1. Create `src/pages/MyNewPage.tsx`
2. Add route in `src/routes/index.tsx`:

```tsx
const MyNewPage = React.lazy(() => import('@/pages/MyNewPage'));

// Inside the router config
{
  path: 'my-page',
  element: (
    <PrivateRoute>
      <Suspense fallback={<LoadingSpinner />}>
        <MyNewPage />
      </Suspense>
    </PrivateRoute>
  ),
}
```

3. Add nav item in `src/layouts/AppLayout.tsx`:

```tsx
const navigationItems = [
  // ...existing items
  { path: '/my-page', label: 'My Page', icon: MyIcon },
];
```

---

## Adding a New API Service

1. Add typed methods to a service file:

```tsx
// src/services/budget.service.ts
import api from './api';
import type { ApiResponse, Budget } from '@/types';

export const budgetService = {
  getAll: () => api.get<ApiResponse<{ budgets: Budget[] }>>('/budgets'),
  create: (data: CreateBudgetPayload) =>
    api.post<ApiResponse<{ budget: Budget }>>('/budgets', data),
};
```

2. Add corresponding types to `src/types/index.ts`
3. Use in a component with `useQuery` / `useMutation`

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Base API URL. Use `/api` for Vite dev proxy |
| `VITE_GOOGLE_CLIENT_ID` | Yes | Google OAuth Client ID |

All Vite env vars must be prefixed with `VITE_` to be accessible in browser code.

---

## Code Style Guidelines

- **TypeScript strict mode** — no `any` unless absolutely required
- **Functional components** — no class components
- **Named exports** — avoid default exports for components
- **Co-location** — keep component-specific types/utils near the component
- **Error boundaries** — wrap async data sections in error boundary components
- **Accessibility** — all interactive elements must have `aria-label` or visible label
