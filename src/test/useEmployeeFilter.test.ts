// useEmployeeFilter.test.ts
//
// Tests for the filter hook in isolation — no components, no DOM.
// This is possible BECAUSE the hook has no JSX and owns only logic.
// Angular analogy: unit testing a service without mounting a component.
//
// renderHook() from React Testing Library lets you call a hook
// and inspect its return value directly.

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useEmployeeFilter } from '@/hooks/useEmployeeFilter';
import type { Employee } from '@/types/employee';

const mockEmployees: Employee[] = [
  { id: 1, name: 'Alice Johnson', department: 'Engineering' },
  { id: 2, name: 'Brian Smith', department: 'Sales' },
  { id: 3, name: 'Carla Diaz', department: 'Engineering' },
  { id: 4, name: 'David Chen', department: 'Marketing' },
];

describe('useEmployeeFilter', () => {
  it('returns all employees when search is empty and department is All', () => {
    const { result } = renderHook(() => useEmployeeFilter(mockEmployees));

    expect(result.current.filteredEmployees).toHaveLength(4);
  });

  it('filters employees by name (case-insensitive)', () => {
    const { result } = renderHook(() => useEmployeeFilter(mockEmployees));

    // act() wraps any state update — same as Angular's fixture.detectChanges()
    act(() => result.current.setSearchTerm('alice'));

    expect(result.current.filteredEmployees).toHaveLength(1);
    expect(result.current.filteredEmployees[0].name).toBe('Alice Johnson');
  });

  it('filters employees by department', () => {
    const { result } = renderHook(() => useEmployeeFilter(mockEmployees));

    act(() => result.current.setDepartment('Engineering'));

    expect(result.current.filteredEmployees).toHaveLength(2);
    expect(result.current.filteredEmployees.every(e => e.department === 'Engineering')).toBe(true);
  });

  it('combines name search and department filter', () => {
    const { result } = renderHook(() => useEmployeeFilter(mockEmployees));

    act(() => {
      result.current.setSearchTerm('carla');
      result.current.setDepartment('Engineering');
    });

    expect(result.current.filteredEmployees).toHaveLength(1);
    expect(result.current.filteredEmployees[0].name).toBe('Carla Diaz');
  });

  it('returns empty array when no employees match', () => {
    const { result } = renderHook(() => useEmployeeFilter(mockEmployees));

    act(() => result.current.setSearchTerm('xyz-no-match'));

    expect(result.current.filteredEmployees).toHaveLength(0);
  });

  it('clearSearch resets both filters', () => {
    const { result } = renderHook(() => useEmployeeFilter(mockEmployees));

    act(() => {
      result.current.setSearchTerm('alice');
      result.current.setDepartment('Engineering');
    });

    act(() => result.current.clearSearch());

    expect(result.current.searchTerm).toBe('');
    expect(result.current.department).toBe('All');
    expect(result.current.filteredEmployees).toHaveLength(4);
  });

  it('builds the departments list with All as first item', () => {
    const { result } = renderHook(() => useEmployeeFilter(mockEmployees));

    expect(result.current.departments[0]).toBe('All');
    expect(result.current.departments).toContain('Engineering');
    expect(result.current.departments).toContain('Sales');
    expect(result.current.departments).toContain('Marketing');
  });
});
