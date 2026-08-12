import { memo } from 'react';
import type { Employee } from '@/types/employee';

// React.memo: skips re-render if `employee` prop reference hasn't changed.
// Named inner function (not arrow) so it shows correctly in React DevTools.
// Angular equivalent: ChangeDetectionStrategy.OnPush.

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
