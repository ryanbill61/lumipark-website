import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 pt-24 pb-24 text-center">
      <div className="tabular text-xs uppercase tracking-[0.22em] text-steel mb-4">404</div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
        This page doesn't exist.
      </h1>
      <p className="mt-4 text-ink-soft">
        The link may be broken, or the page may have moved.
      </p>
      <Link
        to="/"
        className="inline-block mt-8 bg-steel text-white px-5 py-3 text-sm font-medium hover:bg-steel-deep transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
