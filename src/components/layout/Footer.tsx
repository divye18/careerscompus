import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Courses', href: '/courses' },
  { label: 'Universities', href: '/universities' },
  { label: 'Careers', href: '/careers' },
  { label: 'Compare', href: '/compare' },
  { label: 'Counselling', href: '/counselling' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const TOP_STREAMS = [
  { label: 'Engineering', href: '/streams/engineering' },
  { label: 'Medical', href: '/streams/medical' },
  { label: 'Management', href: '/streams/management' },
  { label: 'Law', href: '/streams/law' },
  { label: 'Science', href: '/streams/science' },
  { label: 'Commerce', href: '/streams/commerce' },
  { label: 'Arts', href: '/streams/arts' },
  { label: 'Design', href: '/streams/design' },
];

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <div>
              <Link 
                href="/" 
                className="text-2xl font-extrabold text-white tracking-tight inline-block mb-2"
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
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Top Streams */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-6">Top Streams</h3>
            <ul className="space-y-3">
              {TOP_STREAMS.map((stream) => (
                <li key={stream.label}>
                  <Link href={stream.href} className="text-sm hover:text-white transition-colors">
                    {stream.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 mt-0.5 text-slate-500" />
                <span className="text-sm">hello@careerscompus.in</span>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 mt-0.5 text-slate-500" />
                <span className="text-sm">+91 1800-123-4567</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 mt-0.5 text-slate-500" />
                <span className="text-sm leading-relaxed">
                  123 Education Hub, Sector 62<br />
                  Noida, UP 201309<br />
                  India
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <p className="text-sm">
            © {new Date().getFullYear()} CareersCompus. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
