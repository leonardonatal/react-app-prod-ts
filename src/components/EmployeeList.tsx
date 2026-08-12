import type { Employee } from '@/types/employee';
import EmployeeListItem from './EmployeeListItem';

// EmployeeList.tsx — renders the filtered list or an empty state.
// key={employee.id}: stable unique id, never the array index.
// Angular equivalent: *ngFor with trackBy: trackById.

interface EmployeeListProps {
  employees: Employee[];
}

export default function EmployeeList({ employees }: EmployeeListProps) {
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
