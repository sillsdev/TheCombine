import { Box, Grid2, Stack, Typography } from "@mui/material";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getCurrentPermissions, hasGraylistEntries } from "backend";
import GoalHistoryButton from "components/GoalTimeline/GoalHistoryButton";
import GoalNameButton from "components/GoalTimeline/GoalNameButton";
import { asyncAddGoal, asyncGetUserEdits } from "goals/Redux/GoalActions";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
import { Goal, GoalName, GoalType } from "types/goals";
import {
  goalNameToGoal,
  goalTypeToName,
  requiredPermission,
} from "utilities/goalUtilities";

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
  availableGoalTypes: GoalType[],
  goalTypeSuggestions: GoalType[]
): GoalName[] {
  const suggestions = goalTypeSuggestions.filter((t) =>
    availableGoalTypes.includes(t)
  );
  const nonSuggestions = availableGoalTypes.filter(
    (t) => !suggestions.includes(t)
  );
  suggestions.push(...nonSuggestions);
  return suggestions.map(goalTypeToName);
}

/** List of goals, followed by goal history. */
export default function GoalTimeline(): ReactElement {
  const dispatch = useAppDispatch();

  const { allGoalTypes, goalTypeSuggestions, history } = useAppSelector(
    (state: StoreState) => state.goalsState
  );

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
      hasGraylist
        ? allGoalTypes.concat([GoalType.ReviewDeferredDups])
        : allGoalTypes
    ).filter((t) => permissions.includes(requiredPermission(t)));

    setGoalOptions(createSuggestionData(goalTypes, goalTypeSuggestions));
  }, [allGoalTypes, goalTypeSuggestions, hasGraylist]);

  useEffect(() => {
    getGoalTypes();
  }, [getGoalTypes]);

  const goalHistory = collapseHistory([...history].reverse());

  return (
    <>
      {/* Goals */}
      <Grid2 container justifyContent="space-evenly">
        {goalOptions.map((g, i) => (
          <GoalNameButton
            goalName={g}
            key={g}
            onClick={() => dispatch(asyncAddGoal(goalNameToGoal(g)))}
            recommended={i === 0 && goalTypeSuggestions.length > 0}
          />
        ))}
      </Grid2>

      {/* History */}
      <Box mt={6}>
        <Typography variant="h6" gutterBottom>
          {t("goal.selector.past")}
        </Typography>
        <Stack direction="row" spacing={2} sx={{ overflowX: "auto" }}>
          {goalHistory.length ? (
            goalHistory.map((g, i) => (
              <GoalHistoryButton
                goal={g}
                key={i}
                onClick={() => dispatch(asyncAddGoal(g))}
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
