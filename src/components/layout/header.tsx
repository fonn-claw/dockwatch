import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  mobileMenuButton?: React.ReactNode;
}

export function Header({ title, breadcrumbs, mobileMenuButton }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        {mobileMenuButton}
        <div className="min-w-0 flex-1">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-1">
              <Link href="/dashboard" className="hover:text-slate-700 transition-colors">
                Home
              </Link>
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span className="text-slate-300">/</span>
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-slate-700 transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-slate-700">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          <h1 className="text-2xl font-semibold text-slate-900 truncate">{title}</h1>
        </div>
      </div>
    </header>
  );
}
