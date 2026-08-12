// useEmployees.ts
//
// Data-fetching hook — owns the async lifecycle: loading, error, data.
// Calls the service layer, never fetch() directly.
//
// This is the manual version of what TanStack Query does automatically
// (caching, background refetching, deduplication, etc.).
// For a real app with multiple data sources, swap this for:
//   const { data, isLoading, error } = useQuery({ queryKey: ['employees'], queryFn: getEmployees })
//
// Angular analogy: a service method returning an Observable, subscribed in
// the component — except here the hook owns the subscription lifecycle
// and cleans up via the useEffect return function.

import { useEffect, useState } from 'react';
import type { Employee } from '@/types/employee';
import { getEmployees } from '@/services/employeeService';

// Explicit return type — documents the contract for any component using this hook
interface UseEmployeesReturn {
  employees: Employee[];
  isLoading: boolean;
  error: string | null;
}

export function useEmployees(): UseEmployeesReturn {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true); // true on mount — request is already in flight
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Abort flag — prevents a state update if the component unmounts
    // before the request finishes (avoids "setState on unmounted component" warning)
    let cancelled = false;

    async function fetchEmployees() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getEmployees();

        // Only update state if the component is still mounted
        if (!cancelled) {
          setEmployees(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Something went wrong');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchEmployees();

    // Cleanup: if the component unmounts while the request is in flight,
    // the cancelled flag prevents stale state updates.
    // Angular equivalent: unsubscribe() in ngOnDestroy.
    return () => {
      cancelled = true;
    };
  }, []); // [] = run once on mount, like ngOnInit

  return { employees, isLoading, error };
}
