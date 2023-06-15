import { Button, ImageList, ImageListItem, Typography } from "@mui/material";
import {
  CSSProperties,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import { getUserRole } from "backend";
import { getCurrentUser } from "backend/localStorage";
import GoalList from "components/GoalTimeline/GoalList";
import { Goal, GoalsState, GoalType } from "types/goals";
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
    marginLeft: "auto",
    marginRight: "auto",
    justifyContent: "center",
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

interface GoalTimelineProps extends GoalsState {
  currentProjectId: string;
  chooseGoal: (goal: Goal) => void;
  clearHistory: () => void;
  loadHistory: () => void;
}

/**
 * Displays the list of goals the user has decided they will work on, their choices
 * for the next goal, and suggestions for which goals they should choose to work on.
 */
export default function GoalTimeline(props: GoalTimelineProps): ReactElement {
  const [availableGoalTypes, setAvailableGoalTypes] = useState<GoalType[]>([]);
  const [suggestedGoalTypes, setSuggestedGoalTypes] = useState<GoalType[]>([]);

  const [loaded, setLoaded] = useState(false);
  const [portrait, setPortrait] = useState(true);

  const { t } = useTranslation();

  const { windowHeight, windowWidth } = useWindowSize();

  useEffect(() => {
    if (!loaded) {
      props.loadHistory();
      setLoaded(true);
    }
  }, [loaded, props]);

  useEffect(() => {
    setPortrait(windowWidth - 40 < windowHeight);
  }, [windowHeight, windowWidth]);

  const getGoalTypes = useCallback(async (): Promise<void> => {
    const userRoleId = getCurrentUser()?.projectRoles[props.currentProjectId];
    if (!userRoleId) {
      return;
    }
    const permissions = (await getUserRole(userRoleId)).permissions;
    const goalTypes = props.allGoalTypes.filter((t) =>
      permissions.includes(requiredPermission(t))
    );
    setAvailableGoalTypes(goalTypes);
    setSuggestedGoalTypes(
      goalTypes.filter((t) => props.goalTypeSuggestions.includes(t))
    );
  }, [props]);

  useEffect(() => {
    getGoalTypes();
  }, [getGoalTypes]);

  // Given a change event, find which goal the user selected, and choose it
  // as the next goal to work on.
  function handleChange(goal: Goal): void {
    props.chooseGoal(goal);
  }

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
        onClick={() => props.chooseGoal(goal)}
        id={`new-goal-${goal.name}`}
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
        <div style={{ ...timelineStyle.paneStyling, float: "right" }}>
          <GoalList
            orientation="horizontal"
            data={createSuggestionData(
              availableGoalTypes,
              props.goalTypeSuggestions
            )}
            handleChange={handleChange}
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
            data={[...props.history].reverse()}
            handleChange={handleChange}
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
          style={{ ...timelineStyle.paneStyling, float: "right" }}
        >
          <Typography variant="h6">{t("goal.selector.other")}</Typography>
          <GoalList
            orientation="vertical"
            data={createSuggestionData(
              availableGoalTypes,
              props.goalTypeSuggestions
            )}
            handleChange={handleChange}
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
            data={[...props.history].reverse()}
            handleChange={handleChange}
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
