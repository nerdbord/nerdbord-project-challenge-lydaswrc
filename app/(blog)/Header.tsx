"use client";

import { Container } from "@/components/craft";
import Link from "next/link";

export const Header = () => {
  return (
    <Container>
      <header className="flex justify-between items-center py-4 px-7 border-b">
        <Link href="/">
          <span className="bg-slate-800 text-slate-50 shadow-md font-bold p-2 rounded-full hover:bg-slate-500">
            HHH
          </span>
        </Link>

        <span className="text-slate-900 text-[14px]">Have a nice day 😺</span>
      </header>
    </Container>
  );
};
