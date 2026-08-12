// DepartmentFilter.tsx — purely presentational, controlled select.

interface DepartmentFilterProps {
  departments: string[];
  value: string;
  onChange: (value: string) => void;
}

export default function DepartmentFilter({ departments, value, onChange }: DepartmentFilterProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Filter by department"
      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
    >
      {departments.map((dept) => (
        <option key={dept} value={dept}>
          {dept}
        </option>
      ))}
    </select>
  );
}
