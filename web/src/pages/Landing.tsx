import React from "react";
import DrawerLayout from "../components/DrawerLayout";

export default function Landing() {
  return (
    <DrawerLayout>
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          Welcome to Lianel
        </h1>
        <p className="mt-3 text-slate-600">
          This is your landing page. Use the menu to explore.
        </p>
      </div>
    </DrawerLayout>
  );
}