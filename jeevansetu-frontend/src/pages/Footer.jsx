// Path :- jeevansetu-frontend/src/pages/Footer.jsx

import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { BiDonateBlood } from "react-icons/bi";

export default function Footer() {
  const team = [
    {
      name: "Madhav P",
      linkedin: "https://www.linkedin.com/in/madhav-p-156b9b290/",
      github: "https://github.com/Madhav-P-2005",
    },
    {
      name: "Amruth Badi",
      linkedin: "https://www.linkedin.com/in/amruth-badi-937193291/",
      github: "https://github.com/amruthbadi0999",
    },
    {
      name: "Guruprasad Charati",
      linkedin: "https://www.linkedin.com/in/guruprasad-charati-03b31a2b2/",
      github: "",
    },
  ];

  return (
    <footer className="mt-20 border-t border-white/10 bg-black/40 backdrop-blur-md text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 via-red-600 to-orange-500 flex items-center justify-center shadow-lg">
            <BiDonateBlood className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight">Our Team</h3>
            <p className="text-sm text-white/70">The people behind जीवन Setu</p>
          </div>
        </div>

        {/* Team grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map((m) => (
            <div
              key={m.name}
              className="group rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transform-gpu hover:-translate-y-0.5 transition-transform duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold">{m.name}</p>
                  <p className="text-xs text-white/60">Contributor</p>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={m.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${m.name} on LinkedIn`}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10"
                  >
                    <FaLinkedin className="w-4 h-4" />
                  </a>
                  <a
                    href={m.github}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${m.name} on GitHub`}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10"
                  >
                    <FaGithub className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm text-white/70">
            Developed by <span className="font-semibold text-white">Madhav P</span>, <span className="font-semibold text-white">Amruth Badi</span>, and <span className="font-semibold text-white">Guruprasad Charati</span> with <span className="text-rose-400">❤️</span>
          </p>
          <p className="text-xs text-white/50"> {new Date().getFullYear()} Jeevan Setu. Copyright © All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}