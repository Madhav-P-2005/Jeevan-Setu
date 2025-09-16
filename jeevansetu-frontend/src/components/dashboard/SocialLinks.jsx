// Path: jeevansetu-frontend/src/components/dashboard/SocialLinks.jsx
import React from "react";

const SafeLink = ({ label, href }) => {
  const has = typeof href === "string" && href.trim().length > 0;
  if (!has) return <span className="text-white/60">Not provided</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-rose-300 hover:text-rose-200 underline underline-offset-4 break-all"
      title={`${label} profile`}
    >
      {href}
    </a>
  );
};

const SocialLinks = ({ social }) => {
  return (
    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <span className="block text-sm text-white/60">Instagram</span>
        <div className="mt-1"><SafeLink label="Instagram" href={social?.instagram} /></div>
      </div>
      <div>
        <span className="block text-sm text-white/60">X</span>
        <div className="mt-1"><SafeLink label="X" href={social?.x} /></div>
      </div>
      <div>
        <span className="block text-sm text-white/60">Facebook</span>
        <div className="mt-1"><SafeLink label="Facebook" href={social?.facebook} /></div>
      </div>
    </div>
  );
};

export default SocialLinks;
