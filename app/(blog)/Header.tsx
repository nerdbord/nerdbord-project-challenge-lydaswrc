"use client";

import { Container } from "@/components/craft";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/posts", label: "Posts" },
];

export const Header = () => {
  const pathname = usePathname();

  return (
    <Container>
      <header className="flex justify-between items-center py-4 px-7 border-b">
        <Link href="/">
          <span>HHH</span>
        </Link>
        <nav>
          <ul className="flex gap-x-5 text-[14px]">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`${pathname === link.href ? "text-slate-900" : "text-slate-400"}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </Container>
  );
};
