import { Button, Stack, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { GoalName } from "types/goals";

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
      color={recommended ? "secondary" : "primary"}
      onClick={() => onClick()}
      sx={{
        border: recommended ? "2px solid #009900" : undefined,
        boxShadow: recommended ? "0 0 8px #009900" : undefined,
      }}
      variant="contained"
    >
      <Stack>
        <Typography variant="h4">{t(goalName + ".title")}</Typography>
        <Typography>{t(goalName + ".description")}</Typography>
      </Stack>
    </Button>
  );
}
