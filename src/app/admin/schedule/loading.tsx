export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-52 bg-gray-200 rounded-lg" />
        <div className="h-9 w-28 bg-gray-200 rounded-lg" />
      </div>
      <div className="grid grid-cols-7 gap-3">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="rounded-card bg-white border border-line p-3 min-h-[200px] space-y-2">
            <div className="h-4 w-12 bg-gray-200 rounded mb-3" />
            {i <= 3 && [1, 2].map((j) => (
              <div key={j} className="rounded-lg border p-2 space-y-1.5">
                <div className="h-3 w-16 bg-gray-200 rounded" />
                <div className="h-3 w-12 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
