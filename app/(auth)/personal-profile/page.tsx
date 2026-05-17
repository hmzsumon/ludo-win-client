// ✅ app/(ludo)/personal-profile/page.tsx
// Personal Profile page route

import PersonalProfileShell from "@/components/profile/PersonalProfileShell";
import React from "react";

// ✅ Page title metadata
export const metadata = {
  title: "Personal Profile",
};

const PersonalProfilePage = () => {
  return <PersonalProfileShell />;
};

export default React.memo(PersonalProfilePage);
