// Single source of truth for the Employee shape.
// Every component, hook, and data file imports from here.
// If the API contract changes, you update one interface and
// TypeScript will flag every broken usage across the codebase.

export interface Employee {
  id: number;
  name: string;
  department: string;
}
