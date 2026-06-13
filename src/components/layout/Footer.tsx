import Link from "next/link";
import { Scale } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Scale className="h-5 w-5 text-amber-600" />
              <span className="font-semibold">ClauseGuard</span>
              <span className="text-xs text-amber-600 font-medium">India</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-powered contract review built for Indian businesses.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-3">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/demo" className="text-sm text-muted-foreground hover:text-foreground">Demo</Link></li>
              <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link></li>
              <li><Link href="/security" className="text-sm text-muted-foreground hover:text-foreground">Security</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-3">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">About</Link></li>
              <li><Link href="/#contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-3">Legal</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-muted-foreground">Privacy Policy</span></li>
              <li><span className="text-sm text-muted-foreground">Terms of Service</span></li>
              <li><span className="text-sm text-muted-foreground">AI Disclaimer</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ClauseGuard India. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            AI-assisted review — not a substitute for legal advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
