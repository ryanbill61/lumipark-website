import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import Logo from "@/components/Logo";
import DifyChat from "@/components/DifyChat";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/ecosystem", label: "Our Ecosystem" },
  { to: "/products", label: "Products" },
  { to: "/oem-odm", label: "OEM / ODM" },
  { to: "/technical", label: "Technical" },
  { to: "/contact", label: "Contact" },
];

function navClass({ isActive }: { isActive: boolean }) {
  return isActive
    ? "text-ink border-b border-ink pb-0.5"
    : "text-ink-soft hover:text-ink transition-colors";
}

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Site-wide top trust strip */}
      <div className="border-b border-ink/10 bg-bone-2">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-2 text-center text-xs uppercase tracking-[0.14em] text-ink">
          UL · ETL · DLC Listed Lines ｜ ISO 9001:2015 Certified Facilities
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-bone/90 backdrop-blur rule-bottom">
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center" onClick={() => setOpen(false)}>
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={navClass} end={n.to === "/"}>
                {n.label}
              </NavLink>
            ))}
            <Link
              to="/contact"
              className="bg-steel text-white px-4 py-2 text-sm font-medium hover:bg-steel-deep transition-colors"
            >
              Request a Quote
            </Link>
          </nav>

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden w-11 h-11 flex flex-col items-center justify-center gap-1.5 border border-ink/20"
          >
            <span className={`block w-5 h-px bg-ink transition-transform ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
            <span className={`block w-5 h-px bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-px bg-ink transition-transform ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
          </button>
        </div>

        {open && (
          <nav className="md:hidden rule-top bg-bone">
            <div className="px-5 py-4 flex flex-col">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="py-3 text-base border-b border-ink/10 text-ink"
                >
                  {n.label}
                </Link>
              ))}
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="mt-4 mb-2 bg-steel text-white text-center px-4 py-3 text-sm font-medium"
              >
                Request a Quote
              </Link>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-ink text-bone mt-24">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-10 text-sm">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-3">
              <Logo light />
            </div>
            <p className="text-bone/60 leading-relaxed">
              Your complete lighting supply chain partner — three specialized industrial parks,
              in-house manufacturing, North America-grade quality.
            </p>
            <p className="text-bone/40 text-xs mt-3">LEAPPON and BMC are brands of LumiPark Group.</p>
          </div>
          <div>
            <div className="text-bone/50 uppercase tracking-[0.18em] text-xs mb-3">Site</div>
            <ul className="space-y-2 text-bone/80">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="hover:text-bone">{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-bone/50 uppercase tracking-[0.18em] text-xs mb-3">Certifications</div>
            <ul className="space-y-2 text-bone/80">
              <li>UL 1598 / 8750</li>
              <li>ETL · DLC · Energy Star</li>
              <li>FCC · RoHS</li>
              <li>ISO 9001 · LM-79/80</li>
            </ul>
          </div>
          <div>
            <div className="text-bone/50 uppercase tracking-[0.18em] text-xs mb-3">Owner</div>
            <ul className="space-y-2 text-bone/80">
              <li>
                <Link to="/admin" className="hover:text-bone">Admin login</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="rule-top border-bone/15">
          <div className="max-w-7xl mx-auto px-5 md:px-8 py-5 text-xs text-bone/50 flex justify-between">
            <span>© {new Date().getFullYear()} LumiPark Group</span>
            <span>Supply Chain Owner · 3 Industrial Parks · In-House Manufacturing</span>
          </div>
        </div>
      </footer>
      <DifyChat />
    </div>
  );
}
