// employeeService.ts
//
// Service layer — the only place in the app that knows HOW data is fetched.
// Components and hooks never call fetch() directly; they go through here.
//
// Angular analogy: an @Injectable() service with an HttpClient call.
// The difference: no DI system — you just import and call the function.
//
// Right now it uses a setTimeout to fake network latency.
// To point it at a real API you change ONE thing: replace the mock below
// with a real fetch() call. Nothing else in the app changes.

import type { Employee } from '@/types/employee';
import { employees as mockDatabase } from '@/data/employees';
// ↑ data/ is the fake "database" — simulates what the server would return as JSON.
// In production this import disappears and fetch() takes its place.

// Simulates a real API call:
// - Returns a Promise (async, like fetch)
// - Has a fake 800ms network delay
// - Can randomly fail to simulate a server error (flip SIMULATE_ERROR to true)
const SIMULATE_ERROR = false;

export async function getEmployees(): Promise<Employee[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (SIMULATE_ERROR) {
        reject(new Error('Failed to fetch employees. Please try again.'));
      } else {
        // Spread to return a copy, never the original array reference
        resolve([...mockDatabase]);
      }
    }, 800);
  });
}

// When you're ready to use a real API, replace the function above with:
//
// export async function getEmployees(): Promise<Employee[]> {
//   const response = await fetch('/api/employees');
//   if (!response.ok) throw new Error('Failed to fetch employees');
//   return response.json();
// }

// export async function getEmployees(): Promise<Employee[]> {
//   const response = await fetch('/api/employees');
//   if (!response.ok) throw new Error('Failed to fetch employees');
//   return response.json();
// }
