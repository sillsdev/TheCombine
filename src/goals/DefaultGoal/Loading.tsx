import { Box, Typography } from "@mui/material";
import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";

import HarvestThreshWinnow from "components/HarvestThreshWinnow";

/** A custom loading page */
export default function Loading(): ReactElement {
  const { t } = useTranslation();
  return (
    <Box
      alignItems="center"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      rowGap={3}
    >
      <Typography variant="h4">{t("generic.loadingTitle")}</Typography>
      <HarvestThreshWinnow fadeOutSeparate loading />
      <Typography variant="h5">{t("generic.loadingText")}</Typography>
    </Box>
  );
}
