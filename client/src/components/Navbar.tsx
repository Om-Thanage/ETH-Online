"use client";
import Link from "next/link";
import Login from "./Login";

export default function Navbar() {
  return (
    <nav className="w-full flex justify-between items-center px-6 py-4 border-b-4 border-white bg-black">
      <div className="flex items-center gap-8">
        <Link href="/">
          <span className="text-xl font-extrabold tracking-wide text-white cursor-pointer hover:text-gray-300">
            NeoCorp
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/verify" className="text-white hover:text-gray-300 font-bold">
            Verify
          </Link>
          <Link href="/issuer" className="text-white hover:text-gray-300 font-bold">
            Issuers
          </Link>
          <Link href="/admin/login" className="text-white hover:text-gray-300 font-bold">
            Admin
          </Link>
          <Link href="/api/docs" className="text-white hover:text-gray-300 font-bold">
            API Docs
          </Link>
        </div>
      </div>
      <Login />
    </nav>
  );
}
