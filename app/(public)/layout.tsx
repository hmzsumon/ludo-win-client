import React from "react";

const PublicLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <main className="">
      <div>{children}</div>
    </main>
  );
};

export default PublicLayout;
