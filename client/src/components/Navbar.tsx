"use client";
import Login from "./Login";

export default function Navbar() {
  return (
    <nav className="w-full flex justify-between items-center px-6 py-4 border-b-4 border-white bg-black">
      <div className="flex items-center gap-3">
        <span className="text-xl font-extrabold tracking-wide text-white">NeoCorp</span>
      </div>
      <Login />
    </nav>
  );
}
