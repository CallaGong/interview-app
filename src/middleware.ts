import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { isClerkConfigured } from "@/lib/clerk-config";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

const isProtectedRoute = createRouteMatcher([
  "/case(.*)",
  "/resume(.*)",
  "/interview(.*)",
  "/api/case(.*)",
  "/api/resume(.*)",
  "/api/interview(.*)",
]);

type ClerkMiddlewareFn = ReturnType<typeof clerkMiddleware>;

/** Lazy init — clerkMiddleware() throws if env vars are missing at module load. */
let clerkHandler: ClerkMiddlewareFn | null = null;

function getClerkHandler(): ClerkMiddlewareFn {
  if (!clerkHandler) {
    clerkHandler = clerkMiddleware(async (auth, req) => {
      if (isPublicRoute(req)) return;
      if (isProtectedRoute(req)) {
        await auth.protect();
      }
    });
  }
  return clerkHandler;
}

function unconfiguredResponse(req: NextRequest): NextResponse {
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        error:
          "Authentication is not configured. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in Vercel, then redeploy.",
      },
      { status: 503 }
    );
  }
  return NextResponse.redirect(new URL("/", req.url));
}

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  if (!isClerkConfigured()) {
    if (isProtectedRoute(req)) {
      return unconfiguredResponse(req);
    }
    return NextResponse.next();
  }

  return getClerkHandler()(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
