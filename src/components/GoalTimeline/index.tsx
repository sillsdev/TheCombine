import {
  Box,
  Grid2,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getCurrentPermissions, hasGraylistEntries } from "backend";
import GoalHistoryButton from "components/GoalTimeline/GoalHistoryButton";
import GoalNameButton from "components/GoalTimeline/GoalNameButton";
import { asyncAddGoal, asyncGetUserEdits } from "goals/Redux/GoalActions";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
import { Goal, GoalName } from "types/goals";
import { goalNameToGoal, requiredPermission } from "utilities/goalUtilities";

/** Collapse history items with same name & changes. */
function collapseHistory(goals: Goal[]): Goal[] {
  const seen: Record<string, number> = {};
  const collapsed: Goal[] = [];

  for (const goal of goals) {
    const key = `${goal.name}-${JSON.stringify(goal.changes)}`;
    if (!seen[key]) {
      seen[key] = 1;
      collapsed.push(goal);
    } else {
      seen[key] += 1;
    }
  }

  return collapsed;
}

/** Creates a list of suggestions, with non-suggested goals at the end.
 * Extracted for testing purposes. */
export function createSuggestionData(
  availableGoals: GoalName[],
  goalSuggestions: GoalName[]
): GoalName[] {
  const suggestions = goalSuggestions.filter((t) => availableGoals.includes(t));
  const nonSuggestions = availableGoals.filter((t) => !suggestions.includes(t));
  return [...suggestions, ...nonSuggestions];
}

/** List of goals, followed by goal history. */
export default function GoalTimeline(): ReactElement {
  const dispatch = useAppDispatch();

  const { allGoals, goalSuggestions, history } = useAppSelector(
    (state: StoreState) => state.goalsState
  );

  const small = useMediaQuery<Theme>((th) => th.breakpoints.down("md"));

  const [goalOptions, setGoalOptions] = useState<GoalName[]>([]);
  const [hasGraylist, setHasGraylist] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    dispatch(asyncGetUserEdits());
    hasGraylistEntries().then(setHasGraylist);
  }, [dispatch]);

  const getGoalTypes = useCallback(async (): Promise<void> => {
    const permissions = await getCurrentPermissions();
    const goalTypes = (
      hasGraylist ? allGoals.concat([GoalName.ReviewDeferredDups]) : allGoals
    ).filter((t) => permissions.includes(requiredPermission(t)));

    setGoalOptions(createSuggestionData(goalTypes, goalSuggestions));
  }, [allGoals, goalSuggestions, hasGraylist]);

  useEffect(() => {
    getGoalTypes();
  }, [getGoalTypes]);

  const goalHistory = collapseHistory([...history].reverse());

  return (
    <>
      {/* Goals */}
      <Grid2
        container
        justifyContent="space-evenly"
        spacing={3}
        sx={{ p: 2, py: small ? 2 : 4 }}
      >
        {goalOptions.map((g, i) => (
          <Grid2 key={g} size={{ xs: 6, md: 3 }}>
            <GoalNameButton
              goalName={g}
              onClick={() => dispatch(asyncAddGoal(goalNameToGoal(g)))}
              recommended={i === 0 && goalSuggestions.length > 0}
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
                small={small}
              />
            ))
          ) : (
            <GoalHistoryButton />
          )}
        </Stack>
      </Box>
    </>
  );
}
