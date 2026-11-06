import Link from 'next/link';

// Only the homepage exists. Every link jumps to a real, finished homepage section. Pages that do not exist yet are
// plain text marked "coming soon", never a link, and nothing points at sections that are hidden or unfinished.
interface FooterItem { label: string; href?: string }

const QUICK_LINKS: FooterItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Courses', href: '/#act-courses' },
  { label: 'Universities', href: '/#act-universities' },
  { label: 'Careers', href: '/#act-discovery' },
  { label: 'Counselling', href: '/#act-guidance' },
];

const LEGAL: FooterItem[] = [{ label: 'Privacy Policy' }, { label: 'Terms of Service' }];

function FooterLink({ item }: { item: FooterItem }) {
  const base = 'inline-flex items-center min-h-[44px] text-sm';
  if (item.href) {
    return (
      <Link href={item.href} className={`${base} hover:text-ivory transition-colors`}>
        {item.label}
      </Link>
    );
  }
  return (
    <span className={`${base} gap-2 text-silver/80`}>
      {item.label}
      <span className="text-[12px]">(coming soon)</span>
    </span>
  );
}

export function Footer() {
  return (
    <footer className="bg-ink-950 text-silver pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
          
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <div>
              <Link 
                href="/" 
                className="text-2xl font-semibold text-ivory tracking-tight inline-block py-2 mb-1"
                
              >
                CareersCompus
              </Link>
              <p className="text-champagne font-mono text-xs uppercase tracking-[0.16em]">Find Your Direction</p>
            </div>
            <p className="text-sm leading-relaxed">
              Explore careers, compare courses, discover universities — and chart your future with confidence.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-ivory font-mono text-xs font-normal uppercase tracking-[0.16em] mb-6">Quick Links</h3>
            <ul>
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <FooterLink item={link} />
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="text-ivory font-mono text-xs font-normal uppercase tracking-[0.16em] mb-6">Contact</h3>
            <p className="text-sm leading-relaxed">
              Contact details will be published when CareersCompus launches. This site is an early preview.
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-ivory/10 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <p className="text-sm">
            © {new Date().getFullYear()} CareersCompus. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-x-6">
            {LEGAL.map((item) => (
              <FooterLink key={item.label} item={item} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
