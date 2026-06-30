export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-32 bg-gray-200 rounded-lg mb-3" />
      <div className="h-4 w-64 bg-gray-100 rounded mb-6" />
      <div className="rounded-card bg-white border border-line overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 flex gap-8">
          {[80, 100, 80, 100, 80, 120, 80].map((w, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: w }} />
          ))}
        </div>
        <div className="divide-y">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="px-4 py-4 flex gap-8 items-center">
              {[80, 100, 80, 100, 80, 120, 80].map((w, j) => (
                <div key={j} className="h-4 bg-gray-100 rounded" style={{ width: w }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
