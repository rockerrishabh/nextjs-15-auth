import Link from "next/link";

function Header() {
  return (
    <header className="bg-gradient-to-bl from-teal-500 via-cyan-500 to-sky-500 text-white">
      <div className="container flex items-center justify-between py-4 max-w-7xl mx-auto">
        <section>
          <Link
            className="flex items-center gap-2 text-xl font-bold hover:scale-105"
            href="/">
            Steller <span>Seller</span>
          </Link>
        </section>
        <nav>
          <ul></ul>
          <form className="px-4 py-1 rounded bg-gray-100 text-black w-full max-w-xs">
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-transparent outline-none"
            />
          </form>
        </nav>
        <section className="flex items-center">
          <Link href={"/sign-up"} className="px-4 py-2">
            Sign Up
          </Link>
          <Link
            href={"/sign-in"}
            className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700/80">
            Sign In
          </Link>
        </section>
      </div>
    </header>
  );
}

export default Header;
