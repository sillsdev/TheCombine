import { Typography } from "@material-ui/core";
import { animate } from "motion";
import React, { ReactElement, useEffect } from "react";
import { useTranslation } from "react-i18next";

import tractor from "resources/tractor.png";

/** A custom loading page */
export default function Loading(): ReactElement {
  const { t } = useTranslation();

  useEffect(() => {
    const half = window.innerWidth * 0.75;
    animate(
      "#loading-tractor",
      { transform: [`translateX(${half}px)`, `translateX(-${half}px)`] },
      { duration: 10, repeat: Infinity, easing: "linear" }
    );
  }, []);

  return (
    <React.Fragment>
      <Typography variant="h4" style={{ textAlign: "center" }}>
        {t("generic.loadingTitle")}
      </Typography>
      <img
        src={tractor}
        alt="Tractor"
        id="loading-tractor"
        style={{ width: "50%", margin: "0% 25%" }}
      />
      <Typography variant="h5" style={{ textAlign: "center" }}>
        {t("generic.loadingText")}
      </Typography>
    </React.Fragment>
  );
}
