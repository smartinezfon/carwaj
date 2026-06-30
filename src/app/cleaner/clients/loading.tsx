export default function Loading() {
  return (
    <div className="animate-pulse space-y-3 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-24 bg-gray-200 rounded-lg" />
        <div className="h-9 w-28 bg-gray-200 rounded-lg" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-card bg-white border border-line p-4 space-y-2">
          <div className="h-5 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-100 rounded" />
          <div className="flex gap-2 mt-2">
            <div className="h-6 w-20 bg-gray-100 rounded-full" />
            <div className="h-6 w-24 bg-gray-100 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
