// Mock data — in a real app this would come from an API call via TanStack Query.
// The data is typed against the Employee interface so any shape mismatch
// is caught at compile time, not at runtime.

import type { Employee } from '@/types/employee';

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
