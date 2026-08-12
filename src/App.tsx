// App.tsx — root component. Orchestrates the feature.
//
// Now uses two hooks with distinct responsibilities:
//   useEmployees()      → async data fetching (loading/error/data)
//   useEmployeeFilter() → synchronous filter state (search/department)
//
// App.tsx still has one job: wire hooks to components.
// No fetch() calls, no filtering logic, no hardcoded data here.

import { useCallback } from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import { useEmployeeFilter } from '@/hooks/useEmployeeFilter';
import SearchBar from '@/components/SearchBar';
import DepartmentFilter from '@/components/DepartmentFilter';
import EmployeeList from '@/components/EmployeeList';
import ResultsSummary from '@/components/ResultsSummary';

export default function App() {
  // Step 1: fetch the data
  const { employees, isLoading, error } = useEmployees();

  // Step 2: filter it — receives the fetched array as input
  const {
    searchTerm, setSearchTerm,
    department, setDepartment,
    departments, filteredEmployees, clearSearch,
  } = useEmployeeFilter(employees);

  const handleClear = useCallback(() => clearSearch(), [clearSearch]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Employee Directory</h1>
        <p className="text-sm text-gray-400 mb-6">Search and filter by department</p>

        <div className="flex gap-2 mb-3">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <DepartmentFilter departments={departments} value={department} onChange={setDepartment} />
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
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
