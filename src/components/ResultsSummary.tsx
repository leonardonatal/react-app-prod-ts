interface ResultsSummaryProps {
  count: number;
}

export default function ResultsSummary({ count }: ResultsSummaryProps) {
  return (
    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
      {count} employee{count !== 1 ? 's' : ''} found
    </p>
  );
}
