// HoldSpace — Auth Middleware
// Protects /dashboard and /onboarding for authenticated healers only
export { auth as middleware } from "@/lib/auth";

export const config = {
    matcher: ["/dashboard/:path*"],
};
