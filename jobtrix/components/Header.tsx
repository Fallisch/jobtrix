import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center">
        <Link
          href="/"
          className="text-xl font-bold tracking-wide hover:text-accent transition-colors"
        >
          JobTRIX
        </Link>
      </div>
    </header>
  );
}
