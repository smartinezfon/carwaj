export default function Loading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-40 bg-gray-200 rounded-lg" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-card bg-white border border-line p-5 space-y-2">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-8 w-14 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      <div className="rounded-card bg-white border border-line p-5 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 bg-gray-100 rounded" />
        ))}
      </div>
    </div>
  );
}
