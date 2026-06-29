import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SetPasswordForm from "./SetPasswordForm";

export const dynamic = "force-dynamic";

export default async function SetPasswordPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: employee } = await supabase
    .from("employees")
    .select("role, must_change_password")
    .eq("auth_user_id", session.user.id)
    .single();

  if (!employee) redirect("/login");
  if (!employee.must_change_password) {
    redirect(employee.role === "admin" ? "/admin" : "/cleaner");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-[392px] rounded-card bg-white border border-line p-9 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.32)]">
        <h1 className="text-[25px] font-extrabold tracking-tight m-0">Set your password</h1>
        <p className="mt-[7px] mb-7 text-muted text-[14.5px]">
          You're using a temporary password. Choose your own to continue.
        </p>
        <SetPasswordForm role={employee.role} />
      </div>
    </div>
  );
}
