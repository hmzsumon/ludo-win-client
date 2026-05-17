import React from "react";

const Loading = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="lds-ring">
      {new Array(4).fill(null).map((_, key) => (
        <div key={key} />
      ))}
    </div>
  </div>
);

export default React.memo(Loading);
