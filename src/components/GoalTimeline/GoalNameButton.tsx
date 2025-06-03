import { Button, Stack, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import IconTypography from "components/GoalTimeline/IconTypography";
import { GoalName } from "types/goals";
import { goalNameToIcon } from "utilities/goalUtilities";

interface GoalNameButtonProps {
  goalName: GoalName;
  onClick: () => void;
  recommended?: boolean;
  small?: boolean;
}

export default function GoalNameButton(
  props: GoalNameButtonProps
): ReactElement {
  const { goalName, onClick, recommended, small } = props;
  const { t } = useTranslation();

  return (
    <Button
      onClick={() => onClick()}
      fullWidth
      sx={{
        alignItems: "flex-start",
        boxShadow: recommended ? "0 0 16px #090" : undefined,
        height: "100%",
        minHeight: small ? "150px" : "200px",
        p: 2,
      }}
      variant="contained"
    >
      <Stack spacing={small ? 1 : 2}>
        {/* Goal name */}
        <IconTypography
          icon={goalNameToIcon(goalName, small ? "medium" : "large")}
          variant={small ? "h5" : "h4"}
        >
          {t(goalName + ".title")}
        </IconTypography>

        {/* Goal description */}
        <Typography>{t(goalName + ".description")}</Typography>
      </Stack>
    </Button>
  );
}
