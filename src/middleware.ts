import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
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
  const isProtected = path.startsWith("/cleaner") || path.startsWith("/admin");

  if (isProtected && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (session && (path.startsWith("/cleaner") || path.startsWith("/admin"))) {
    const { data: employee } = await supabase
      .from("employees")
      .select("role, must_change_password")
      .eq("auth_user_id", session.user.id)
      .single();

    if (employee?.must_change_password) {
      const url = request.nextUrl.clone();
      url.pathname = "/set-password";
      return NextResponse.redirect(url);
    }

    if (path.startsWith("/admin") && employee?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/cleaner";
      return NextResponse.redirect(url);
    }
    if (path.startsWith("/cleaner") && employee?.role !== "cleaner") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/cleaner/:path*", "/admin/:path*"],
};
