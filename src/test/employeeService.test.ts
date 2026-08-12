// employeeService.test.ts
//
// Tests the service layer in isolation.
// We mock the data module so the service isn't tied to specific fixture data.
// This means if data/employees.ts changes, the service tests don't break.
//
// vi.mock() is Vitest's module mock — replaces the real import
// with a controlled fake for the duration of the test.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getEmployees } from '@/services/employeeService';
import type { Employee } from '@/types/employee';

// Replace the real data import with a controlled fake
vi.mock('@/data/employees', () => ({
  employees: [
    { id: 1, name: 'Alice Johnson', department: 'Engineering' },
    { id: 2, name: 'Brian Smith', department: 'Sales' },
  ] satisfies Employee[],
}));

describe('getEmployees', () => {
  beforeEach(() => vi.clearAllMocks());

  it('resolves with the employee list', async () => {
    const result = await getEmployees();

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Alice Johnson');
  });

  it('returns a copy, not the original array reference', async () => {
    const first = await getEmployees();
    const second = await getEmployees();

    // Both contain the same data but are different array instances.
    // Mutating one should not affect the other.
    expect(first).not.toBe(second);
    expect(first).toEqual(second);
  });
});
