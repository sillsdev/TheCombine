import { Button, ImageList, ImageListItem, Typography } from "@mui/material";
import {
  CSSProperties,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import { getCurrentPermissions, getGraylistEntries } from "backend";
import GoalList from "components/GoalTimeline/GoalList";
import { asyncAddGoal, asyncGetUserEdits } from "goals/Redux/GoalActions";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
import { Goal, GoalType } from "types/goals";
import { requiredPermission, goalTypeToGoal } from "utilities/goalUtilities";
import { useWindowSize } from "utilities/useWindowSize";

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
  goalTypeSuggestions: GoalType[]
): Goal[] {
  const suggestions = goalTypeSuggestions.filter((t) =>
    availableGoalTypes.includes(t)
  );
  if (!suggestions.length) {
    return availableGoalTypes.map(goalTypeToGoal);
  }
  const secondarySuggestions = suggestions.slice(1);
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

  const [hasGraylist, setHasGraylist] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [portrait, setPortrait] = useState(true);

  const { t } = useTranslation();

  const { windowHeight, windowWidth } = useWindowSize();

  useEffect(() => {
    if (!loaded) {
      dispatch(asyncGetUserEdits());
      setLoaded(true);
    }
    const updateHasGraylist = async (): Promise<void> =>
      setHasGraylist(
        await getGraylistEntries(1).then((res) => res.length !== 0)
      );
    updateHasGraylist();
  }, [dispatch, loaded]);

  useEffect(() => {
    setPortrait(windowWidth - 40 < windowHeight);
  }, [windowHeight, windowWidth]);

  const getGoalTypes = useCallback(async (): Promise<void> => {
    const permissions = await getCurrentPermissions();
    const goalTypes = (
      hasGraylist
        ? allGoalTypes.concat([GoalType.ReviewDeferredDups])
        : allGoalTypes
    ).filter((t) => permissions.includes(requiredPermission(t)));
    setAvailableGoalTypes(goalTypes);
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
      <ImageList cols={13} rowHeight="auto">
        {/* Alternatives */}
        <ImageListItem
          cols={5}
          style={{ ...timelineStyle.paneStyling, float: "inline-end" }}
        >
          <Typography variant="h6">{t("goal.selector.other")}</Typography>
          <GoalList
            orientation="vertical"
            data={createSuggestionData(availableGoalTypes, goalTypeSuggestions)}
            handleChange={chooseGoal}
            size={35}
            numPanes={3}
          />
        </ImageListItem>

        {/* Recommendation */}
        <ImageListItem cols={3} style={timelineStyle.paneStyling}>
          <Typography variant="h5">{t("goal.selector.present")}</Typography>
          {goalButton()}
        </ImageListItem>

        {/* History */}
        <ImageListItem cols={5} style={timelineStyle.paneStyling}>
          <Typography variant="h6">{t("goal.selector.past")}</Typography>
          <GoalList
            completed
            orientation="vertical"
            data={[...history].reverse()}
            handleChange={chooseGoal}
            size={35}
            numPanes={3}
            scrollable
          />
        </ImageListItem>
      </ImageList>
    );
  }

  return portrait ? renderPortrait() : renderLandscape();
}
