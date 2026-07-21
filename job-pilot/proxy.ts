import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@insforge/sdk/ssr";
import type { CookieStore, CookieOptions } from "@insforge/sdk/ssr";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Create base response
  const response = NextResponse.next();
  
  // Implement compatible CookieStore for Request cookies
  const requestCookies: CookieStore = {
    get: (name: string) => request.cookies.get(name)?.value,
    set: (nameOrOptions: any, value?: any, options?: CookieOptions) => {
      if (typeof nameOrOptions === "string") {
        request.cookies.set(nameOrOptions, value);
        response.cookies.set(nameOrOptions, value, options);
      } else {
        request.cookies.set(nameOrOptions.name, nameOrOptions.value);
        response.cookies.set(nameOrOptions.name, nameOrOptions.value, nameOrOptions);
      }
    },
    delete: (nameOrOptions: any, options?: CookieOptions) => {
      if (typeof nameOrOptions === "string") {
        request.cookies.delete(nameOrOptions);
        response.cookies.set(nameOrOptions, "", { ...options, maxAge: 0 });
      } else {
        request.cookies.delete(nameOrOptions.name);
        response.cookies.set(nameOrOptions.name, "", { ...nameOrOptions, maxAge: 0 });
      }
    }
  };

  // Implement compatible CookieStore for Response cookies
  const responseCookies: CookieStore = {
    get: (name: string) => response.cookies.get(name)?.value,
    set: (nameOrOptions: any, value?: any, options?: CookieOptions) => {
      if (typeof nameOrOptions === "string") {
        response.cookies.set(nameOrOptions, value, options);
      } else {
        response.cookies.set(nameOrOptions.name, nameOrOptions.value, nameOrOptions);
      }
    },
    delete: (nameOrOptions: any, options?: CookieOptions) => {
      if (typeof nameOrOptions === "string") {
        response.cookies.set(nameOrOptions, "", { ...options, maxAge: 0 });
      } else {
        response.cookies.set(nameOrOptions.name, "", { ...nameOrOptions, maxAge: 0 });
      }
    }
  };
  
  // Update session & cookies
  const result = await updateSession({
    requestCookies,
    responseCookies
  });

  const isAuthenticated = !!result.accessToken;

  // Protected routes matcher
  const isProtectedRoute = 
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/find-jobs");

  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to login page
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if logged-in user visits login page
  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/find-jobs/:path*",
    "/login"
  ],
};
