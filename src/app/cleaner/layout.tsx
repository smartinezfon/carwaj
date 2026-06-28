import CleanerNav from "@/components/CleanerNav";

export default function CleanerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen max-w-md mx-auto bg-gray-50">
      <CleanerNav />
      <main className="p-4 space-y-3">{children}</main>
    </div>
  );
}
