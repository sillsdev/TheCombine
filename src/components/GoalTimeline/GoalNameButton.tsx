import { Button, Stack, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { GoalName } from "types/goals";
import { goalNameToIcon } from "utilities/goalUtilities";

interface GoalNameButtonProps {
  goalName: GoalName;
  onClick: () => void;
  recommended?: boolean;
}

export default function GoalNameButton(
  props: GoalNameButtonProps
): ReactElement {
  const { t } = useTranslation();
  const { onClick, goalName, recommended } = props;
  return (
    <Button
      onClick={() => onClick()}
      sx={{
        boxShadow: recommended ? "0 0 16px #009900" : undefined,
        minHeight: "200px",
      }}
      variant="contained"
    >
      <Stack>
        {goalNameToIcon(goalName)}
        <Typography variant="h4">{t(goalName + ".title")}</Typography>
        <Typography>{t(goalName + ".description")}</Typography>
      </Stack>
    </Button>
  );
}
