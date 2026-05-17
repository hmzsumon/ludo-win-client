import React from "react";
import Container from "../container";

const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  return <Container>{children}</Container>;
};

export default React.memo(AppWrapper);
