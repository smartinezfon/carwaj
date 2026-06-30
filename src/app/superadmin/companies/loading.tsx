export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <div className="h-7 w-36 bg-gray-200 rounded-lg" />
          <div className="h-4 w-28 bg-gray-100 rounded" />
        </div>
        <div className="h-9 w-32 bg-gray-200 rounded-lg" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-card bg-white border border-line p-5 space-y-4">
            <div className="flex justify-between">
              <div className="space-y-1.5">
                <div className="h-6 w-44 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-100 rounded" />
              </div>
              <div className="h-6 w-20 bg-gray-100 rounded-full" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="bg-canvas rounded-control px-3 py-2 space-y-1">
                  <div className="h-5 w-8 bg-gray-200 rounded mx-auto" />
                  <div className="h-3 w-16 bg-gray-100 rounded mx-auto" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
