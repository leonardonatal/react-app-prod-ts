# Employee Directory — How a Senior React Dev Builds This From Scratch

> React 19 · TypeScript · Vite · Tailwind CSS

---

## Before touching the keyboard

A junior opens VS Code immediately. A senior opens a notes app first.

You ask yourself:
- *"What does this thing actually do?"* — Filter a list. That's it. One view, no routing needed.
- *"Where does the data come from?"* — An API. Even if it's mock data today, I'll structure it like a real network call from day one. That means async, loading states, and error handling — not a hardcoded import.
- *"What will change vs. what will stay stable?"* — The search term and department change constantly (user typing). The employee list comes from the server once. That distinction tells me I need two separate hooks: one for fetching, one for filtering.
- *"What could scale?"* — The list could grow to thousands. I'll write the filter with `useMemo` now so I'm not refactoring later.

**Decision made:** Vite + React + TypeScript. Single view, no routing, no backend yet. Keep it minimal — every dependency I add today is something a teammate maintains tomorrow.

---

## Step 1 — Scaffold

```bash
npm create vite@latest employee-directory -- --template react-ts
cd employee-directory
npm install
```

*"I'm choosing `react-ts` template because TypeScript from day one costs nothing and saves hours. Adding it to an existing JS project later is painful."*

---

## Step 2 — Install Tailwind

```bash
npm install -D tailwindcss @tailwindcss/vite @types/node
```

*"`@types/node` is for the path alias config in `vite.config.ts` — it uses `node:url` which TypeScript needs type declarations for. Dev-only, zero impact on the bundle."*

*"I'm not installing a component library like MUI or shadcn. This is a focused exercise — a library would add 200kb and 3 new abstractions just to render a list. Tailwind gives me styling without CSS specificity wars or naming classes."*

Replace `src/index.css` with just:
```css
@import "tailwindcss";
```

---

## Step 3 — Configure Vite + TypeScript

**`vite.config.ts`:**
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

**`tsconfig.json`** — add inside `compilerOptions`:
```json
"baseUrl": ".",
"paths": { "@/*": ["src/*"] }
```

**`tsconfig.node.json`** — separate config for Vite config files (they run in Node, not the browser):
```json
{
  "compilerOptions": {
    "composite": true,
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "skipLibCheck": true,
    "strict": true,
    "types": ["node"]
  },
  "include": ["vite.config.ts"]
}
```

*"Two tsconfigs because `vite.config.ts` runs in Node.js (needs `node:url`, `node:path`) and `src/` runs in the browser (needs DOM types). They're different environments — mixing their type definitions causes false errors. This is the standard Vite project setup you'll see on any real team."*

*"I'm setting up `@/` alias before writing a single component. Without it, three levels deep I'll have `../../../components/Foo` everywhere. With `@/components/Foo` it doesn't matter where the importing file lives — move a file, nothing breaks."*

---

## Step 4 — Plan the folder structure (on paper, not in code yet)

```
src/
├── types/        ← shared contracts — first thing written
├── services/     ← API calls — the only layer that talks to the server
├── data/         ← mock "database" (replaced by real API later)
├── hooks/        ← logic: one hook for fetching, one for filtering
├── components/   ← UI only — no fetch(), no business logic
├── App.tsx       ← orchestrator
└── main.tsx      ← entry point
```

*"I'm separating `types/` because `Employee` is used across services, hooks, and components. Defining it inside a component creates a dependency on that component just to get a type — wrong direction. Types are contracts, they live independently."*

*"I'm separating `services/` from `hooks/` because they have different jobs. The service knows HOW to fetch (URL, headers, error handling). The hook knows WHEN to fetch and what to do with the result (loading state, error state). This matters when you have 10 services — you don't want fetch logic scattered across hooks."*

*"I'm separating `hooks/` from `components/` because logic and rendering are different concerns. A hook has no JSX. A component has no business logic. This separation is what makes both testable in isolation."*

```bash
mkdir -p src/types src/services src/data src/hooks src/components
```

---

## Step 5 — Write the type first

**`src/types/employee.ts`**
```ts
export interface Employee {
  id: number;
  name: string;
  department: string;
}
```

*"First file, always. Not the component, not the hook, not the service — the data shape. Everything else is downstream of this. If I write components first and the API team tells me it's `fullName` not `name`, I'm doing find-and-replace across 6 files. With a central interface, I change one line and TypeScript tells me exactly what broke."*

---

## Step 6 — Write the mock data

**`src/data/employees.ts`**
```ts
import type { Employee } from '@/types/employee';

// The fake "database" — what the server would return as JSON.
// The service layer imports from here. In production, this file disappears
// and the service calls a real fetch() instead.
export const employees: Employee[] = [
  { id: 1, name: 'Alice Johnson', department: 'Engineering' },
  { id: 2, name: 'Brian Smith', department: 'Sales' },
  { id: 3, name: 'Carla Diaz', department: 'Engineering' },
  { id: 4, name: 'David Chen', department: 'Marketing' },
  { id: 5, name: 'Elena Novak', department: 'Sales' },
  { id: 6, name: 'Farid Hassan', department: 'Engineering' },
  { id: 7, name: 'Grace Kim', department: 'Human Resources' },
  { id: 8, name: 'Hugo Almeida', department: 'Marketing' },
];
```

---

## Step 7 — Write the service layer

**`src/services/employeeService.ts`**
```ts
import type { Employee } from '@/types/employee';
import { employees as mockDatabase } from '@/data/employees';

const SIMULATE_ERROR = false; // flip to true to test the error state

export async function getEmployees(): Promise<Employee[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (SIMULATE_ERROR) {
        reject(new Error('Failed to fetch employees. Please try again.'));
      } else {
        resolve([...mockDatabase]); // spread = return a copy, never the original
      }
    }, 800);
  });
}

// When you're ready for a real API, replace the function above with:
//
// export async function getEmployees(): Promise<Employee[]> {
//   const res = await fetch('/api/employees');
//   if (!res.ok) throw new Error('Failed to fetch employees');
//   return res.json();
// }
```

*"The service is the only place in the entire app that knows HOW data is fetched — which URL, which headers, how to handle a non-200 response. Every other layer just calls `getEmployees()` and gets back a typed array. When the API URL changes, or we add an auth header, we change one file."*

*"It returns a Promise because that's what `fetch()` returns in real life. The fake 800ms delay makes the loading state visible — you'd never see it if data was synchronous. Returning a copy with `[...mockDatabase]` is intentional: never hand out a reference to internal state."*

*"To switch to a real API, I change exactly one function. Zero other files change. That's the value of this layer."*

---

## Step 8 — Write the data-fetching hook

**`src/hooks/useEmployees.ts`**
```ts
import { useEffect, useState } from 'react';
import type { Employee } from '@/types/employee';
import { getEmployees } from '@/services/employeeService';

interface UseEmployeesReturn {
  employees: Employee[];
  isLoading: boolean;
  error: string | null;
}

export function useEmployees(): UseEmployeesReturn {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchEmployees() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getEmployees();
        if (!cancelled) setEmployees(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchEmployees();

    return () => { cancelled = true; }; // cleanup — prevents state update on unmounted component
  }, []); // [] = run once on mount, like ngOnInit

  return { employees, isLoading, error };
}
```

*"Three states to always handle for async data: loading, error, data. A UI that doesn't handle loading and error is broken — it just hasn't shown it yet."*

*"The `cancelled` flag is the React pattern for unmount safety. If the component unmounts before the request finishes, the cleanup function sets `cancelled = true` — the response arrives but state is never updated. Angular equivalent: unsubscribing in `ngOnDestroy`."*

*"`useEffect` with `[]` runs once after mount. The return function is the cleanup — same as `ngOnDestroy`."*

*"This is the manual version of TanStack Query. In production with many data sources, swap it: `const { data, isLoading, error } = useQuery({ queryKey: ['employees'], queryFn: getEmployees })`. The service layer stays identical."*

---

## Step 9 — Write the filter hook (logic before UI)

**`src/hooks/useEmployeeFilter.ts`**
```ts
import { useCallback, useMemo, useState } from 'react';
import type { Employee } from '@/types/employee';

export function useEmployeeFilter(employees: Employee[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [department, setDepartment] = useState('All');

  const departments = useMemo(
    () => ['All', ...new Set(employees.map((e) => e.department))],
    [employees]
  );

  const filteredEmployees = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    return employees.filter((e) => {
      const matchesName = e.name.toLowerCase().includes(normalized);
      const matchesDept = department === 'All' || e.department === department;
      return matchesName && matchesDept;
    });
  }, [employees, searchTerm, department]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDepartment('All');
  }, []);

  return { searchTerm, setSearchTerm, department, setDepartment, departments, filteredEmployees, clearSearch };
}
```

*"This hook has one responsibility: given an array of employees, return a filtered subset based on user input. It doesn't care where the array came from — static, API, WebSocket, doesn't matter. That's why it's separate from `useEmployees`. One hook fetches. One hook filters. Both are independently testable."*

*"`useMemo` on the filter — 8 employees doesn't matter, but I'm demonstrating the pattern. On 10,000 employees it's the difference between a smooth UI and a laggy one."*

*"`useCallback` on `clearSearch` — stable function reference. If I pass this to a `React.memo`'d child without `useCallback`, the child re-renders on every keystroke even if nothing about the button changed."*

---

## Step 10 — Build components bottom-up (smallest → largest)

*"I always start with leaf components — the ones that have no children. They have zero dependencies on other components, so I can reason about them in isolation."*

**Order: `ResultsSummary` → `SearchBar` → `DepartmentFilter` → `EmployeeListItem` → `EmployeeList` → `App`**

---

**`src/components/ResultsSummary.tsx`**
```tsx
interface ResultsSummaryProps {
  count: number;
}

export default function ResultsSummary({ count }: ResultsSummaryProps) {
  return (
    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
      {count} employee{count !== 1 ? 's' : ''} found
    </p>
  );
}
```

---

**`src/components/SearchBar.tsx`**
```tsx
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <input
      type="text"
      placeholder="Search employees by name..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Search employees by name"
      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  );
}
```

*"No `useState` inside `SearchBar`. The value lives in the hook, gets passed down as a prop, and the component calls `onChange` when the user types. This is a controlled input — Angular's `[(ngModel)]` but explicit in both directions. Reusable anywhere — no opinion about where its value comes from."*

*"`aria-label` is non-negotiable. Accessibility isn't optional on a senior-level submission."*

---

**`src/components/DepartmentFilter.tsx`**
```tsx
interface DepartmentFilterProps {
  departments: string[];
  value: string;
  onChange: (value: string) => void;
}

export default function DepartmentFilter({ departments, value, onChange }: DepartmentFilterProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Filter by department"
      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
    >
      {departments.map((dept) => (
        <option key={dept} value={dept}>{dept}</option>
      ))}
    </select>
  );
}
```

---

**`src/components/EmployeeListItem.tsx`**
```tsx
import { memo } from 'react';
import type { Employee } from '@/types/employee';

const EmployeeListItem = memo(function EmployeeListItem({ employee }: { employee: Employee }) {
  return (
    <li className="flex justify-between items-center py-3 px-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg transition-colors">
      <span className="text-sm font-medium text-gray-900">{employee.name}</span>
      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
        {employee.department}
      </span>
    </li>
  );
});

export default EmployeeListItem;
```

*"`React.memo` here because this component renders inside a list that re-renders on every keystroke. Without memo, every row re-renders even if its data didn't change."*

*"Named inner function, not an arrow function — shows as 'EmployeeListItem' in React DevTools instead of 'Anonymous'. Small thing, big difference when debugging in the profiler."*

---

**`src/components/EmployeeList.tsx`**
```tsx
import type { Employee } from '@/types/employee';
import EmployeeListItem from './EmployeeListItem';

export default function EmployeeList({ employees }: { employees: Employee[] }) {
  if (employees.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-sm">No employees found.</p>
      </div>
    );
  }

  return (
    <ul>
      {employees.map((employee) => (
        <EmployeeListItem key={employee.id} employee={employee} />
      ))}
    </ul>
  );
}
```

*"`key={employee.id}` — never the array index. Filtering changes each employee's array position. React uses the key to track identity across renders — wrong key means React reuses the wrong DOM node, causing state to jump between rows."*

*"Empty state lives here, not in `App`. `App` doesn't need to know the difference between zero results and many — that's the list's responsibility."*

---

## Step 11 — Wire everything in App.tsx (last)

**`src/App.tsx`**
```tsx
import { useCallback } from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import { useEmployeeFilter } from '@/hooks/useEmployeeFilter';
import SearchBar from '@/components/SearchBar';
import DepartmentFilter from '@/components/DepartmentFilter';
import EmployeeList from '@/components/EmployeeList';
import ResultsSummary from '@/components/ResultsSummary';

export default function App() {
  const { employees, isLoading, error } = useEmployees();
  const { searchTerm, setSearchTerm, department, setDepartment, departments, filteredEmployees, clearSearch } = useEmployeeFilter(employees);
  const handleClear = useCallback(() => clearSearch(), [clearSearch]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Employee Directory</h1>
        <p className="text-sm text-gray-400 mb-6">Search and filter by department</p>

        <div className="flex gap-2 mb-3">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <DepartmentFilter departments={departments} value={department} onChange={setDepartment} />
          <button type="button" onClick={handleClear}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
            Clear
          </button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <p className="text-sm text-gray-400 text-center py-8">Loading employees...</p>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Data state — only render when we have data */}
        {!isLoading && !error && (
          <>
            <ResultsSummary count={filteredEmployees.length} />
            <EmployeeList employees={filteredEmployees} />
          </>
        )}
      </div>
    </div>
  );
}
```

*"`App.tsx` has one job: call the hooks and pass data to components. No filtering logic, no fetch calls, no hardcoded data. If this file starts getting long, that's a smell."*

*"Three conditional render blocks — loading, error, data. This is non-negotiable for anything async. A UI that jumps straight to rendering without handling loading and error states looks unfinished to any senior reviewer."*

*"`useEmployees` feeds its `employees` array directly into `useEmployeeFilter`. The filter hook doesn't care where the data came from — static array, API, WebSocket, doesn't matter. The two hooks are completely decoupled."*

---

## Step 12 — Clean up and run

```bash
rm src/App.css
rm -rf src/assets
npm run dev
```

Open **http://localhost:5173** — you'll see the 800ms loading state, then the list appears.
Flip `SIMULATE_ERROR = true` in `src/services/employeeService.ts` to test the error state.

---

## What you say out loud during the interview

> *"I'm starting from the type definition because it's the contract everything downstream depends on."*

> *"I have a service layer because it's the only place that knows how data is fetched. URL, headers, error handling — all in one file. When the API changes, nothing else touches."*

> *"I have two separate hooks: one for fetching, one for filtering. Different lifecycles, different reasons to change. The filter hook doesn't care where the array came from."*

> *"I always handle three states for async data: loading, error, and the data itself. A UI that skips those is broken — it just hasn't shown it yet."*

> *"The `cancelled` flag in `useEffect` prevents state updates on unmounted components — same as unsubscribing in Angular's `ngOnDestroy`."*

> *"I'm wrapping the list item in `React.memo` because the parent re-renders on every keystroke. Without it, every row re-renders even if its data didn't change."*

> *"I'm using `employee.id` as the list key, never the array index — filtering changes positions, so index-as-key causes React to match the wrong DOM nodes."*

> *"I didn't add React Router, TanStack Query, or Zustand. For this scope they'd be over-engineering. I don't add dependencies speculatively."*

**That last point is the most senior thing you can say. Juniors reach for libraries. Seniors justify every one they add.**


## Tech Stack

| Tool | Purpose |
|---|---|
| [React 19](https://react.dev) | UI library |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Vite](https://vitejs.dev) | Build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com) | Styling |

## Features

- 🔍 Live search by employee name (as you type)
- 🏷️ Filter by department
- 🔄 Simulated async API with loading & error states
- ⚡ Memoized filtering (`useMemo`) — skips recompute when inputs haven't changed
- 🧠 `React.memo` on list rows — skips re-render on unrelated state changes
- ♿ Accessible inputs with `aria-label`

## Architecture

```
src/
├── types/
│   └── employee.ts           # Shared interface — single source of truth for the data shape
├── data/
│   └── employees.ts          # Mock "database" — replaced by a real API in production
├── services/
│   └── employeeService.ts    # Service layer — the only place that knows HOW data is fetched
├── hooks/
│   ├── useEmployees.ts       # Async data fetching: loading / error / data states
│   └── useEmployeeFilter.ts  # Synchronous filter logic: search + department + derived list
├── components/
│   ├── SearchBar.tsx         # Controlled input — no internal state
│   ├── DepartmentFilter.tsx  # Controlled select — no internal state
│   ├── EmployeeList.tsx      # Renders list or empty state
│   ├── EmployeeListItem.tsx  # React.memo'd row
│   └── ResultsSummary.tsx    # Result count display
├── App.tsx                   # Orchestrator — wires hooks to components, renders states
└── main.tsx                  # Entry point
```

### Key design decisions

**Types first** — `employee.ts` is the first file written. Every hook, service, and component imports from it. If the API contract changes, TypeScript flags every broken usage automatically.

**Service layer** — `employeeService.ts` is the only file that knows how to fetch data. To switch from mock data to a real API, you change one function. Nothing else in the app changes:

```ts
// Replace this mock...
export async function getEmployees(): Promise<Employee[]> {
  return new Promise(resolve => setTimeout(() => resolve([...mockDatabase]), 800));
}

// ...with this real fetch:
export async function getEmployees(): Promise<Employee[]> {
  const res = await fetch('/api/employees');
  if (!res.ok) throw new Error('Failed to fetch employees');
  return res.json();
}
```

**Two hooks, two responsibilities** — `useEmployees` owns the async lifecycle (loading/error/data). `useEmployeeFilter` owns the synchronous filter state. They're decoupled: the filter hook doesn't care whether the array came from a fetch, a WebSocket, or static data.

**Components own nothing** — every component receives all its data via props and calls callbacks to signal changes. No `useState` inside `SearchBar` or `DepartmentFilter`. This makes them reusable and independently testable.

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Simulating API States

In `src/services/employeeService.ts`:

```ts
// Flip to true to trigger the error state
const SIMULATE_ERROR = false;
```

You can also change the `800` ms delay to simulate slow networks.

## Upgrading to TanStack Query

`useEmployees.ts` is the manual equivalent of TanStack Query. When the app grows to multiple data sources, swap it:

```ts
// Before (manual)
const { employees, isLoading, error } = useEmployees();

// After (TanStack Query — adds caching, background refetch, deduplication)
const { data: employees = [], isLoading, error } = useQuery({
  queryKey: ['employees'],
  queryFn: getEmployees,
});
```

The service layer (`getEmployees`) stays identical.
# react-app-prod-ts
