import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  const path = request.nextUrl.pathname;
  const isProtected =
    path.startsWith("/cleaner") ||
    path.startsWith("/admin") ||
    path.startsWith("/superadmin");

  if (isProtected && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (session && isProtected) {
    const { data: employee } = await supabase
      .from("employees")
      .select("role, must_change_password, company_id")
      .eq("auth_user_id", session.user.id)
      .single();

    if (employee?.must_change_password) {
      const url = request.nextUrl.clone();
      url.pathname = "/set-password";
      return NextResponse.redirect(url);
    }

    const role = employee?.role;

    // Check company is active for non-super-admins
    if (role !== "super_admin" && employee?.company_id) {
      const { data: company } = await supabase
        .from("companies")
        .select("status")
        .eq("id", employee.company_id)
        .single();

      if (company && company.status === 'suspended') {
        const url = request.nextUrl.clone();
        url.pathname = "/suspended";
        return NextResponse.redirect(url);
      }
    }

    if (role === "super_admin" && !path.startsWith("/superadmin")) {
      const url = request.nextUrl.clone();
      url.pathname = "/superadmin";
      return NextResponse.redirect(url);
    }
    if (path.startsWith("/admin") && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = role === "super_admin" ? "/superadmin" : "/cleaner";
      return NextResponse.redirect(url);
    }
    if (path.startsWith("/cleaner") && role !== "cleaner") {
      const url = request.nextUrl.clone();
      url.pathname = role === "admin" ? "/admin" : "/superadmin";
      return NextResponse.redirect(url);
    }
    if (path.startsWith("/superadmin") && role !== "super_admin") {
      const url = request.nextUrl.clone();
      url.pathname = role === "admin" ? "/admin" : "/cleaner";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/cleaner/:path*", "/admin/:path*", "/superadmin/:path*"],
};
