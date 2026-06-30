import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen max-w-[1240px] mx-auto">
      <AdminSidebar />
      <main className="flex-1 min-w-0 pt-[72px] px-4 pb-6 md:pt-6 md:pr-6 md:px-0">{children}</main>
    </div>
  );
}
