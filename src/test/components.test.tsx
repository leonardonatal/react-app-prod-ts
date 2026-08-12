// components.test.tsx
//
// Component tests using React Testing Library.
// Philosophy: test what the USER sees and does, not implementation details.
// Don't test class names, internal state, or prop values directly —
// test that the right text appears and interactions work.
//
// render() mounts the component into a real jsdom DOM.
// screen.getBy*() queries the DOM like a user would (by text, role, label).
// userEvent simulates real browser interactions (typing, clicking).

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import SearchBar from '@/components/SearchBar';
import DepartmentFilter from '@/components/DepartmentFilter';
import ResultsSummary from '@/components/ResultsSummary';
import EmployeeList from '@/components/EmployeeList';
import type { Employee } from '@/types/employee';

const mockEmployees: Employee[] = [
  { id: 1, name: 'Alice Johnson', department: 'Engineering' },
  { id: 2, name: 'Brian Smith', department: 'Sales' },
];

// --- SearchBar ---
describe('SearchBar', () => {
  it('renders the input with correct placeholder', () => {
    render(<SearchBar value="" onChange={vi.fn()} />);

    expect(screen.getByPlaceholderText('Search employees by name...')).toBeInTheDocument();
  });

  it('calls onChange with the typed value', async () => {
    const handleChange = vi.fn();
    render(<SearchBar value="" onChange={handleChange} />);

    await userEvent.type(screen.getByRole('textbox'), 'Ali');

    // Called once per character typed
    expect(handleChange).toHaveBeenCalledTimes(3);
    expect(handleChange).toHaveBeenLastCalledWith('i'); // last char
  });

  it('reflects the controlled value', () => {
    render(<SearchBar value="alice" onChange={vi.fn()} />);

    expect(screen.getByRole('textbox')).toHaveValue('alice');
  });
});

// --- DepartmentFilter ---
describe('DepartmentFilter', () => {
  const departments = ['All', 'Engineering', 'Sales'];

  it('renders all department options', () => {
    render(<DepartmentFilter departments={departments} value="All" onChange={vi.fn()} />);

    expect(screen.getByRole('option', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Engineering' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Sales' })).toBeInTheDocument();
  });

  it('calls onChange when a different department is selected', async () => {
    const handleChange = vi.fn();
    render(<DepartmentFilter departments={departments} value="All" onChange={handleChange} />);

    await userEvent.selectOptions(screen.getByRole('combobox'), 'Engineering');

    expect(handleChange).toHaveBeenCalledWith('Engineering');
  });
});

// --- ResultsSummary ---
describe('ResultsSummary', () => {
  it('uses singular "employee" for count of 1', () => {
    render(<ResultsSummary count={1} />);

    expect(screen.getByText('1 employee found')).toBeInTheDocument();
  });

  it('uses plural "employees" for count > 1', () => {
    render(<ResultsSummary count={5} />);

    expect(screen.getByText('5 employees found')).toBeInTheDocument();
  });

  it('uses plural "employees" for count of 0', () => {
    render(<ResultsSummary count={0} />);

    expect(screen.getByText('0 employees found')).toBeInTheDocument();
  });
});

// --- EmployeeList ---
describe('EmployeeList', () => {
  it('renders a row for each employee', () => {
    render(<EmployeeList employees={mockEmployees} />);

    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('Brian Smith')).toBeInTheDocument();
  });

  it('shows the department badge for each employee', () => {
    render(<EmployeeList employees={mockEmployees} />);

    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Sales')).toBeInTheDocument();
  });

  it('shows empty state when the list is empty', () => {
    render(<EmployeeList employees={[]} />);

    expect(screen.getByText('No employees found.')).toBeInTheDocument();
  });
});
