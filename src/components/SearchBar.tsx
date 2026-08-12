// SearchBar.tsx — purely presentational, controlled input.
// Receives value + onChange as props (no internal state).
// Angular equivalent: a dumb component with @Input() and @Output().

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <input
      type="text"
      placeholder="Search employees by name..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Search employees by name"
      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  );
}
