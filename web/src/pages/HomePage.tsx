import React from "react";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <section className="bg-white border border-slate-200 rounded-lg p-6 shadow">
        <h1 className="text-2xl font-bold text-brand-blue">Welcome to Lianel</h1>
        <p className="text-slate-700 mt-3">
          This is your landing page. Use the menu in the top-left corner to navigate,
          or jump straight to the profiles list below.
        </p>
        <div className="mt-5">
          <Link
            to="/profiles"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-brand-green text-white hover:bg-brand-greenDark transition"
          >
            Show Profiles
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;