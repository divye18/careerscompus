import Link from 'next/link';

// Only the homepage exists. Items with an href jump to real homepage sections;
// items without one are shown as "Soon" instead of linking to pages that 404.
interface FooterItem { label: string; href?: string }

const QUICK_LINKS: FooterItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Courses', href: '/#act-courses' },
  { label: 'Universities', href: '/#act-universities' },
  { label: 'Careers', href: '/#act-discovery' },
  { label: 'Compare', href: '/#act-comparison' },
  { label: 'Counselling', href: '/#act-guidance' },
  { label: 'About' },
  { label: 'Contact' },
];

const TOP_STREAMS: FooterItem[] = ['Engineering', 'Medical', 'Management', 'Law', 'Science', 'Commerce', 'Arts', 'Design'].map(
  (label) => ({ label, href: '/#act-courses' })
);

const LEGAL: FooterItem[] = [{ label: 'Privacy Policy' }, { label: 'Terms of Service' }, { label: 'Sitemap' }];

function FooterLink({ item }: { item: FooterItem }) {
  const base = 'inline-flex items-center min-h-[44px] text-sm';
  if (item.href) {
    return (
      <Link href={item.href} className={`${base} hover:text-white transition-colors`}>
        {item.label}
      </Link>
    );
  }
  return (
    <span className={`${base} gap-2 text-slate-500`}>
      {item.label}
      <span className="text-[11px] uppercase tracking-wider border border-slate-700 rounded px-1.5 py-0.5">Soon</span>
    </span>
  );
}

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <div>
              <Link 
                href="/" 
                className="text-2xl font-extrabold text-white tracking-tight inline-block py-2 mb-1"
                style={{ fontFamily: 'var(--font-plus-jakarta)' }}
              >
                CareersCompus
              </Link>
              <p className="text-sky-400 font-medium text-sm">Find Your Direction</p>
            </div>
            <p className="text-sm leading-relaxed">
              Explore careers, compare courses, discover universities — and chart your future with confidence.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-6">Quick Links</h3>
            <ul>
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <FooterLink item={link} />
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Top Streams */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-6">Top Streams</h3>
            <ul>
              {TOP_STREAMS.map((stream) => (
                <li key={stream.label}>
                  <FooterLink item={stream} />
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-6">Contact</h3>
            <p className="text-sm leading-relaxed">
              Contact details will be published when CareersCompus launches. This site is an early preview.
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
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
