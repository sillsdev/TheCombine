import {
  Box,
  Button,
  Grid2,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Permission } from "api/models";
import { getCurrentPermissions, hasGraylistEntries } from "backend";
import GoalHistoryButton from "components/GoalTimeline/GoalHistoryButton";
import GoalNameButton from "components/GoalTimeline/GoalNameButton";
import { asyncAddGoal, asyncGetUserEdits } from "goals/Redux/GoalActions";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { StoreState } from "rootRedux/types";
import { GoalName } from "types/goals";
import {
  goalNameToGoal,
  hasChanges,
  requiredPermission,
} from "utilities/goalUtilities";

/** List of goals, followed by goal history. */
export default function GoalTimeline(): ReactElement {
  const dispatch = useAppDispatch();

  const { allGoals, history } = useAppSelector(
    (state: StoreState) => state.goalsState
  );

  const small = useMediaQuery<Theme>((th) => th.breakpoints.down("md"));

  const [goalOptions, setGoalOptions] = useState<GoalName[]>([]);
  const [hasGraylist, setHasGraylist] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const { t } = useTranslation();

  useEffect(() => {
    hasGraylistEntries().then(setHasGraylist);
    getCurrentPermissions().then(setPermissions);
  }, []);

  useEffect(() => {
    dispatch(asyncGetUserEdits());
  }, [dispatch]);

  useEffect(() => {
    setGoalOptions(
      allGoals.filter(
        (g) =>
          (g !== GoalName.ReviewDeferredDups || hasGraylist) &&
          permissions.includes(requiredPermission(g))
      )
    );
  }, [allGoals, hasGraylist, permissions]);

  /* Note: reverse() also does an in-place reversal,
   * which is only okay because we are creating a new array with filter(). */
  const goalHistory = history.filter(hasChanges).reverse();

  return (
    <>
      {/* Goals */}
      <Grid2
        container
        justifyContent="space-evenly"
        spacing={3}
        sx={{ p: 2, py: small ? 2 : 4 }}
      >
        {goalOptions.map((g) => (
          <Grid2 key={g} size={{ xs: 6, md: 3 }}>
            <GoalNameButton
              goalName={g}
              onClick={() => dispatch(asyncAddGoal(goalNameToGoal(g)))}
              small={small}
            />
          </Grid2>
        ))}
      </Grid2>

      {/* History */}
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t("goal.selector.past")}
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            overflowX: "auto",
            scrollbarColor: "#ccc transparent",
            scrollbarWidth: "thin",
          }}
        >
          {goalHistory.length ? (
            goalHistory.map((g, i) => (
              <GoalHistoryButton
                goal={g}
                key={i}
                onClick={() => dispatch(asyncAddGoal(g))}
              />
            ))
          ) : (
            <Button disabled variant="contained">
              <Typography variant="h6">
                {t("goal.selector.noHistory")}
              </Typography>
            </Button>
          )}
        </Stack>
      </Box>
    </>
  );
}
