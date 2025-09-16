// Path: jeevansetu-frontend/src/components/dashboard/AddressBlock.jsx
import React from "react";

const AddressBlock = ({ address }) => {
  if (!address) {
    return <p className="text-white/90">Not provided</p>;
  }

  const line1 = address?.line1?.trim();
  const line2 = address?.line2?.trim();
  const postal = address?.postalCode?.trim();

  const line = [line1, line2].filter(Boolean).join(", ");

  return (
    <div>
      <p className="text-white/90">{line || "Not provided"}</p>
      {postal && (
        <p className="text-white/70 text-sm mt-1">Postal Code: {postal}</p>
      )}
    </div>
  );
};

export default AddressBlock;
