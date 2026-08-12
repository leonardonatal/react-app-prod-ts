// useEmployeeFilter.ts
//
// Custom hook — owns ALL state and derived data for the feature.
// Zero JSX. Fully testable in isolation without mounting a component.
// Angular analogy: injectable service with reactive state.
//
// Separation of concerns:
// - Hook  → WHAT data is shown and WHY
// - Components → HOW it looks

import { useCallback, useMemo, useState } from 'react';
import type { Employee } from '@/types/employee';

interface UseEmployeeFilterReturn {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  department: string;
  setDepartment: (value: string) => void;
  departments: string[];
  filteredEmployees: Employee[];
  clearSearch: () => void;
}

export function useEmployeeFilter(employees: Employee[]): UseEmployeeFilterReturn {
  const [searchTerm, setSearchTerm] = useState('');
  const [department, setDepartment] = useState('All');

  // Derived list of unique departments — only recomputes when the source list changes.
  const departments = useMemo(
    () => ['All', ...new Set(employees.map((e) => e.department))],
    [employees]
  );

  // Memoized filter — skips recompute if neither employees, searchTerm
  // nor department changed between renders.
  const filteredEmployees = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    return employees.filter((e) => {
      const matchesName = e.name.toLowerCase().includes(normalized);
      const matchesDept = department === 'All' || e.department === department;
      return matchesName && matchesDept;
    });
  }, [employees, searchTerm, department]);

  // useCallback: stable reference so memoized children don't re-render
  // when App re-renders for unrelated reasons.
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDepartment('All');
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    department,
    setDepartment,
    departments,
    filteredEmployees,
    clearSearch,
  };
}
