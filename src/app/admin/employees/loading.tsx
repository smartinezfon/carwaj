export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-40 bg-gray-200 rounded-lg" />
        <div className="h-9 w-32 bg-gray-200 rounded-lg" />
      </div>
      <div className="rounded-card bg-white border border-line overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 flex gap-8">
          {[140, 160, 80, 100, 120, 100, 100, 120].map((w, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: w }} />
          ))}
        </div>
        <div className="divide-y">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-4 py-4 flex gap-8 items-center">
              {[140, 160, 80, 100, 120, 60, 60, 80].map((w, j) => (
                <div key={j} className="h-4 bg-gray-100 rounded" style={{ width: w }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
