export default function Loading() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-6 w-40 bg-gray-200 rounded-lg" />
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-card bg-white border border-line p-4 space-y-2">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-7 w-12 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
