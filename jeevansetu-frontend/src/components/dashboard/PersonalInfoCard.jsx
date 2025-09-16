// Path: jeevansetu-frontend/src/components/dashboard/PersonalInfoCard.jsx
import React from "react";
import AddressBlock from "./AddressBlock";
import SocialLinks from "./SocialLinks";

const PersonalInfoCard = ({ profile, formatDateTime }) => {
  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6">
      <div className="flex items-center mb-6">
        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
        <h2 className="text-xl font-semibold text-white">Personal Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-white/60">Full Name</label>
            <p className="text-lg text-white/90 font-medium">{profile?.name || "Not provided"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-white/60">Email Address</label>
            <p className="text-lg text-white/90">{profile?.email || "Not provided"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-white/60">Phone Number</label>
            <p className="text-lg text-white/90">{profile?.phone || "Not provided"}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-white/60">City</label>
            <p className="text-lg text-white/90">{profile?.city || "Not provided"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-white/60">State</label>
            <p className="text-lg text-white/90">{profile?.state || "Not provided"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-white/60">Country</label>
            <p className="text-lg text-white/90">{profile?.country || "Not provided"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-white/60">Address</label>
            <AddressBlock address={profile?.address} />
          </div>
          <div>
            <label className="text-sm font-medium text-white/60">Blood Group</label>
            <p className="text-lg text-white/90">{profile?.bloodGroup || "Not provided"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-white/60">Member Since</label>
            <p className="text-lg text-white/90">{formatDateTime(profile?.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Message */}
      <div className="mt-6">
        <label className="text-sm font-medium text-white/60">Message</label>
        <p className="text-white/90 mt-1 whitespace-pre-line">
          {profile?.message?.trim() ? profile.message : "Not provided"}
        </p>
      </div>

      {/* Social Links */}
      <div className="mt-6">
        <label className="text-sm font-medium text-white/60">Social Links</label>
        <SocialLinks social={profile?.social} />
      </div>
    </div>
  );
};

export default PersonalInfoCard;
