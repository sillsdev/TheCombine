import {
  Box,
  Button,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  CSSProperties,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import { getCurrentPermissions, hasGraylistEntries } from "backend";
import GoalList from "components/GoalTimeline/GoalList";
import { asyncAddGoal, asyncGetUserEdits } from "goals/Redux/GoalActions";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
import { Goal, GoalType } from "types/goals";
import { requiredPermission, goalTypeToGoal } from "utilities/goalUtilities";

// Collapse history items with same name + same changes
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

const timelineStyle: { [key: string]: CSSProperties } = {
  centerButton: {
    padding: "70px 0",
    textAlign: "center",
    width: "100%",
    height: "80%",
  },
  paneStyling: {
    display: "block",
    justifyContent: "center",
    marginInline: "auto",
    textAlign: "center",
  },
};

// Creates a list of suggestions, with non-suggested goals at the end and
// our main suggestion absent (to be displayed on the suggestions button).
// Extracted for testing purposes.
export function createSuggestionData(
  availableGoalTypes: GoalType[],
  goalTypeSuggestions: GoalType[],
  keepFirst = false
): Goal[] {
  const suggestions = goalTypeSuggestions.filter((t) =>
    availableGoalTypes.includes(t)
  );
  if (!suggestions.length) {
    return availableGoalTypes.map(goalTypeToGoal);
  }
  const secondarySuggestions = suggestions.slice(keepFirst ? 0 : 1);
  const nonSuggestions = availableGoalTypes.filter(
    (t) => !suggestions.includes(t)
  );
  secondarySuggestions.push(...nonSuggestions);
  return secondarySuggestions.map(goalTypeToGoal);
}

/**
 * Displays the list of goals the user has decided they will work on, their choices
 * for the next goal, and suggestions for which goals they should choose to work on.
 */
export default function GoalTimeline(): ReactElement {
  const dispatch = useAppDispatch();

  const { allGoalTypes, goalTypeSuggestions, history } = useAppSelector(
    (state: StoreState) => state.goalsState
  );

  const chooseGoal = (goal: Goal): Promise<void> =>
    dispatch(asyncAddGoal(goal));

  const [availableGoalTypes, setAvailableGoalTypes] = useState<GoalType[]>([]);
  const [suggestedGoalTypes, setSuggestedGoalTypes] = useState<GoalType[]>([]);
  const [toolGoals, setToolGoals] = useState<Goal[]>([]);
  const [hasGraylist, setHasGraylist] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const { t } = useTranslation();

  const theme = useTheme();
  const isPortrait = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (!loaded) {
      dispatch(asyncGetUserEdits());
      setLoaded(true);
    }

    hasGraylistEntries().then(setHasGraylist);
  }, [dispatch, loaded]);

  const getGoalTypes = useCallback(async (): Promise<void> => {
    const permissions = await getCurrentPermissions();
    const goalTypes = (
      hasGraylist
        ? allGoalTypes.concat([GoalType.ReviewDeferredDups])
        : allGoalTypes
    ).filter((t) => permissions.includes(requiredPermission(t)));

    setAvailableGoalTypes(goalTypes);
    setToolGoals(createSuggestionData(goalTypes, goalTypeSuggestions, true));
    setSuggestedGoalTypes(
      goalTypes.filter((t) => goalTypeSuggestions.includes(t))
    );
  }, [allGoalTypes, goalTypeSuggestions, hasGraylist]);

  useEffect(() => {
    getGoalTypes();
  }, [getGoalTypes]);

  // Creates a button for our recommended goal
  function goalButton(): ReactElement {
    const done = suggestedGoalTypes.length === 0;
    const goal = goalTypeToGoal(suggestedGoalTypes[0]);
    return (
      <Button
        style={timelineStyle.centerButton}
        color="primary"
        variant="contained"
        disabled={done}
        onClick={() => chooseGoal(goal)}
        id={`new-goal-${goal.name}`}
        data-testid="goal-button"
      >
        <Typography variant="h4">
          {t(done ? "goal.selector.done" : goal.name + ".title")}
        </Typography>
      </Button>
    );
  }

  function renderPortrait(): ReactElement {
    return (
      <>
        {/* Alternatives */}
        <div style={{ ...timelineStyle.paneStyling, float: "inline-end" }}>
          <GoalList
            orientation="horizontal"
            data={createSuggestionData(availableGoalTypes, goalTypeSuggestions)}
            handleChange={chooseGoal}
            size={100}
            numPanes={2}
          />
        </div>

        {/* Recommendation */}
        <div style={{ ...timelineStyle.paneStyling, width: "60%" }}>
          <Typography variant="h6">{t("goal.selector.present")}</Typography>
          {goalButton()}
        </div>

        {/* History */}
        <div style={timelineStyle.paneStyling}>
          <Typography variant="h6">{t("goal.selector.past")}</Typography>
          <GoalList
            completed
            orientation="horizontal"
            data={[...history].reverse()}
            handleChange={chooseGoal}
            size={100}
            numPanes={3}
            scrollable
          />
        </div>
      </>
    );
  }

  function renderLandscape(): ReactElement {
    return (
      <Box p={4}>
        {/* TOOL SELECTION ROW */}
        <Typography variant="h5" gutterBottom>
          {t("goal.selector.present")}
        </Typography>
        <GoalList
          data={toolGoals}
          handleChange={chooseGoal}
          numPanes={isPortrait ? 1 : 4}
          orientation="horizontal"
          recommendFirst={suggestedGoalTypes.length > 0}
          scrollable={toolGoals.length > 4}
          size={100}
        />

        {/* HISTORY ROW */}
        <Box mt={6}>
          <Typography variant="h6" gutterBottom>
            {t("goal.selector.past")}
          </Typography>
          <GoalList
            completed
            data={collapseHistory([...history].reverse())}
            handleChange={chooseGoal}
            numPanes={3}
            orientation="horizontal"
            scrollable
            size={100}
          />
        </Box>
      </Box>
    );
  }

  return isPortrait ? renderPortrait() : renderLandscape();
}
