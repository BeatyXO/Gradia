import Link from "next/link";
import { BookOpenCheck, FileCheck2, Gauge, GraduationCap, LibraryBig, PanelTop, ScrollText, Settings, Share2 } from "lucide-react";
import { WalletButton } from "@/components/wallet-button";

const navItems = [
  { href: "/", label: "Command", icon: Gauge },
  { href: "/assessments/new", label: "Assessment", icon: BookOpenCheck },
  { href: "/rubrics", label: "Rubrics", icon: ScrollText },
  { href: "/submissions", label: "Submissions", icon: FileCheck2 },
  { href: "/educator", label: "Educator", icon: LibraryBig },
  { href: "/student", label: "Student", icon: GraduationCap },
  { href: "/consensus", label: "Consensus", icon: Share2 },
  { href: "/contract", label: "Contract", icon: PanelTop },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5EBFA] text-[#2b1238]">
      <header className="sticky top-0 z-30 border-b border-[#A56ABD]/30 bg-[#49225B] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#A56ABD]">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-black">Gradia</p>
              <p className="truncate text-xs text-[#E7DBEF]">Adaptive grading consensus</p>
            </div>
          </Link>
          <WalletButton />
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 px-4 md:grid-cols-[220px_1fr] md:gap-6">
        <aside className="py-4 md:py-6">
          <nav className="grid grid-cols-2 gap-2 md:grid-cols-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex h-11 items-center gap-3 rounded-md px-3 text-sm font-bold text-[#49225B] transition hover:bg-[#E7DBEF]"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0 py-4 md:py-6">{children}</main>
      </div>
    </div>
  );
}
