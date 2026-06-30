export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-28 bg-gray-200 rounded-lg" />
        <div className="h-14 w-48 bg-white border border-line rounded-card" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-card bg-white border border-line p-5 space-y-3">
            <div className="flex justify-between">
              <div className="h-6 w-48 bg-gray-200 rounded" />
              <div className="h-4 w-28 bg-gray-100 rounded" />
            </div>
            <div className="h-4 w-36 bg-gray-100 rounded" />
            <div className="h-4 w-44 bg-gray-100 rounded" />
            <div className="flex gap-2 mt-2">
              {[1, 2].map((j) => (
                <div key={j} className="h-7 w-32 bg-gray-100 rounded-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
