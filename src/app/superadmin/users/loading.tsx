export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 space-y-1.5">
        <div className="h-7 w-24 bg-gray-200 rounded-lg" />
        <div className="h-4 w-48 bg-gray-100 rounded" />
      </div>
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-card bg-white border border-line overflow-hidden">
            <div className="flex justify-between px-5 py-4 border-b border-line bg-gray-50">
              <div className="space-y-1.5">
                <div className="h-5 w-36 bg-gray-200 rounded" />
                <div className="h-3 w-16 bg-gray-100 rounded" />
              </div>
              <div className="h-6 w-20 bg-gray-100 rounded-full" />
            </div>
            {[1, 2, 3].map((j) => (
              <div key={j} className="p-5 border-b border-line space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gray-200" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-32 bg-gray-200 rounded" />
                      <div className="h-3 w-40 bg-gray-100 rounded" />
                    </div>
                  </div>
                  <div className="h-6 w-16 bg-gray-100 rounded-full" />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((k) => (
                    <div key={k} className="bg-canvas rounded-control px-3 py-2 space-y-1">
                      <div className="h-3 w-16 bg-gray-200 rounded" />
                      <div className="h-4 w-8 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
