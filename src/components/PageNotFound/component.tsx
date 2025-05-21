import { Box, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import HarvestThreshWinnow from "components/HarvestThreshWinnow";
import { Path } from "types/path";

/**
 * A custom 404 page that should be displayed anytime the user tries to navigate
 * to a nonexistent route.
 */
export default function PageNotFound(): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Box
      alignItems="center"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      rowGap={3}
    >
      <Typography variant="h4">{t("generic.404Title")}</Typography>
      <div onClick={() => navigate(Path.ProjScreen)}>
        <HarvestThreshWinnow />
      </div>
      <Typography variant="h5">{t("generic.404Text")}</Typography>
    </Box>
  );
}
