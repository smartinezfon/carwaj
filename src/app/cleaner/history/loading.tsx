export default function Loading() {
  return (
    <div className="animate-pulse space-y-3 p-4">
      <div className="h-6 w-28 bg-gray-200 rounded-lg mb-4" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="rounded-card bg-white border border-line p-4 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
          <div className="h-6 w-16 bg-gray-100 rounded-full" />
        </div>
      ))}
    </div>
  );
}
