import { Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import tractor from "resources/tractor.png";
import { Path } from "types/path";

/**
 * A custom 404 page that should be displayed anytime the user tries to navigate
 * to a nonexistent route.
 */
export default function PageNotFound(): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <Typography variant="h4" style={{ textAlign: "center" }}>
        {t("generic.404Title")}
      </Typography>
      <img
        src={tractor}
        alt="Tractor"
        style={{ width: "50%", margin: "0% 25%" }}
        onClick={() => {
          navigate(Path.ProjScreen);
        }}
      />
      <Typography variant="h5" style={{ textAlign: "center" }}>
        {t("generic.404Text")}
      </Typography>
    </>
  );
}
