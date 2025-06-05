import { Box, Button, Stack, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { GoalName } from "types/goals";
import { goalNameToIcon } from "utilities/goalUtilities";

interface GoalNameButtonProps {
  goalName: GoalName;
  onClick: () => void;
  small?: boolean;
}

export default function GoalNameButton(
  props: GoalNameButtonProps
): ReactElement {
  const { goalName, onClick, small } = props;
  const { t } = useTranslation();

  return (
    <Button
      onClick={() => onClick()}
      fullWidth
      sx={{
        alignItems: "flex-start",
        height: "100%",
        minHeight: small ? "150px" : "200px",
        p: 2,
      }}
      variant="contained"
    >
      <Stack spacing={small ? 1 : 2}>
        {/* Goal name */}
        <Typography variant={small ? "h5" : "h4"}>
          <Box
            component="span" // to be inline with the title
            sx={{ marginInlineEnd: 1, verticalAlign: "middle" }}
          >
            {goalNameToIcon(goalName)}
          </Box>
          {t(goalName + ".title")}
        </Typography>

        {/* Goal description */}
        <Typography>{t(goalName + ".description")}</Typography>
      </Stack>
    </Button>
  );
}
