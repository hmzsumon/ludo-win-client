"use client";

import React, { useState } from "react";
// ⬇️ এখানে SHARE_AVAILABLE ইমপোর্ট করবেন না
import { isWebShareSupported, shareLink, successMessage } from "./helpers";
import Modal from "./modal";

interface ShareProps {
  // children-এ onClick ইনজেক্ট করব, তাই টাইপে সেটা allow করলাম
  children: React.ReactElement<{ onClick?: React.MouseEventHandler }>;
  data: ShareData;
  useNativeOption?: boolean;
}

const Share = ({ children, data, useNativeOption = true }: ShareProps) => {
  const [isVisible, setIsVisible] = useState(false);

  // SSR-safe: runtime এ চেক হবে
  const useNativeVersionBrowser = useNativeOption && isWebShareSupported();

  const onClick: React.MouseEventHandler = () => {
    if (useNativeVersionBrowser) {
      // Native share
      shareLink(data);
    } else {
      // Custom modal fallback
      setIsVisible(true);
    }
  };

  const onCloseModal = (isShare = false) => {
    if (isShare) successMessage();
    setIsVisible(false);
  };

  // children-এ onClick ইনজেক্ট
  const childWithHandler = React.cloneElement(children, { onClick });

  return (
    <>
      {childWithHandler}
      {!useNativeVersionBrowser && (
        <Modal isVisible={isVisible} data={data} onCloseModal={onCloseModal} />
      )}
    </>
  );
};

export default React.memo(Share);
