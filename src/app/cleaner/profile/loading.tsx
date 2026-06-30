export default function Loading() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-6 w-24 bg-gray-200 rounded-lg" />
      <div className="rounded-card bg-white border border-line p-5 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-20 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-100 rounded-lg" />
          </div>
        ))}
        <div className="h-10 w-32 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}
