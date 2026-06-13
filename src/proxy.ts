// For demo purposes, allow all access
// In production, uncomment below to require auth
// export { auth as middleware } from "@/lib/auth/config";

// Allow all access for demo
export function proxy() {
  return;
}

export const config = {
  matcher: ["/app/:path*"],
};
