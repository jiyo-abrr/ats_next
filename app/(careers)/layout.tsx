import { SiteHeader } from "@/components/layout/site-header";
import { APP_NAME } from "@/lib/config";

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-surface="careers" className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <footer className="text-muted-foreground border-t py-6 text-center text-xs">
        © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </footer>
    </div>
  );
}
