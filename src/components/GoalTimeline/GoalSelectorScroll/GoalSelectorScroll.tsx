import Card from "@material-ui/core/Card";
import { Button, CardContent, Typography } from "@material-ui/core";
import React, { ReactElement } from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize,
} from "react-localize-redux";

import { Goal, GoalName } from "../../../types/goals";
import { styleAddendum } from "../../../types/theme";
import ContextMenu from "../../ContextMenu/ContextMenu";

const CLICK_SENSITIVITY: number = 10;

// Defines relations of scroller to allow resizing
const NUM_PANES: number = 5; // Number of panes present in the ui. Must be odd
export const WIDTH: number = Math.floor(100 / (NUM_PANES + 2)); // Width of each card
const SCALE_FACTOR_FOR_DESELECTED = 0.9; // The percent of regular size that deselected cards shrink to

// Constants derived from scroller relations
const AMT_OF_PADDING: number = Math.ceil(NUM_PANES / 2); // padding frames added to the sides
export const WRAP_AROUND_THRESHHOLD: number = WIDTH / 2; // The amount of scroll-over needed before tripping the wrap
const DESELECTED_WIDTH: number = WIDTH * SCALE_FACTOR_FOR_DESELECTED; // Width of each not-selected card

// Action names
const SELECT = "selectstart";
const M_DUR = "mousemove";
const M_END = "mouseup";

// classNames
const SCROLL_PANE: string = "scrollPane";
const SCROLL_CONT: string = "scrollCont";
export const SCROLL_CARD: string = "scrollCard"; // Exported for testing

// Style constants
const VIEW_WIDTH: number = WIDTH * NUM_PANES; // Width of the screen's view

// Keyboard constants
const LEFT_KEY: string = "ArrowLeft";
const RIGHT_KEY: string = "ArrowRight";
const ENTER_KEY: string = "Enter";

export interface GoalSelectorScrollProps {
  allPossibleGoals: Goal[];
  selectedIndex: number;
  mouseX: number;
  lastIndex: number;
  swapSelectedIndex: (ndx: number) => void;
  swapMouseX: (iX: number) => void;
  handleChange: (value: GoalName) => void;
}

export class GoalSelectorScroll extends React.Component<
  GoalSelectorScrollProps & LocalizeContextProps
> {
  // Constants used in scrolling mechanics + aesthetics
  readonly LENGTH: number;
  readonly TICKER_WIDTH: number;
  readonly LEAD_PADDING: [string, number, number][];
  readonly END_PADDING: [string, number, number][];

  // The set of styles used to make this UI work
  readonly style = {
    container: {
      padding: "2vw",
      display: "flex",
      flexWrap: "nowrap",
      overflow: "hidden",
    },
    pane: {
      padding: "2vw",
      userselect: "none",
      display: "flex",
      flexWrap: "nowrap",
      overflow: "hidden",
      width: VIEW_WIDTH + "vw",
    },
    scroll: {
      flexWrap: "nowrap",
      display: "flex",
    },
    selectedCard: {
      width: WIDTH + "vw",
    },
    inactiveCard: {
      ...styleAddendum.inactive,
      width: DESELECTED_WIDTH + "vw",
      margin: (WIDTH - DESELECTED_WIDTH) / 2 + "vw",
    },
  };

  scrollRef: any;
  mouseStart: number;
  detectMouse: boolean;

  // Menu anchor: where the right-click menu appears
  anchorElement: Element | null;

  constructor(props: GoalSelectorScrollProps & LocalizeContextProps) {
    super(props);

    // Set LENGTH, TICKER_WIDTH, and padding arrays
    this.LENGTH = props.allPossibleGoals.length;
    this.TICKER_WIDTH = WIDTH * (this.LENGTH + AMT_OF_PADDING * 2 - 1);
    this.LEAD_PADDING = props.allPossibleGoals
      .slice(this.LENGTH - AMT_OF_PADDING, this.LENGTH)
      .map((element: Goal, index: number) => {
        return [
          element.name,
          index + this.LENGTH - AMT_OF_PADDING,
          index + this.LENGTH - AMT_OF_PADDING,
        ];
      });
    this.END_PADDING = props.allPossibleGoals
      .slice(0, AMT_OF_PADDING)
      .map((element: Goal, index: number) => {
        return [element.name, index, index];
      });

    // Bind so as to be able to be used as event listeners/map function
    this.scrollDur = this.scrollDur.bind(this);
    this.scrollEnd = this.scrollEnd.bind(this);
    this.mapScrollCard = this.mapScrollCard.bind(this);
    this.mapWraparoundCard = this.mapWraparoundCard.bind(this);
    this.keyboardListener = this.keyboardListener.bind(this);
    this.resizeListener = this.resizeListener.bind(this);

    // Create scroll ref so that we can programmatically scroll
    this.scrollRef = React.createRef();

    // Used in mouse detection
    this.mouseStart = 0;
    this.detectMouse = true;

    // Menu
    this.anchorElement = null;
  }

  // Updates the position of the ticker upon mounting to override odd FireFox behavior
  componentDidMount() {
    this.centerUI(this.props.selectedIndex);
    window.addEventListener("keydown", this.keyboardListener);
    window.addEventListener("resize", this.resizeListener);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.keyboardListener);
    window.removeEventListener("resize", this.resizeListener);
  }

  // Chooses an index based on the screen's current scroll
  selectNewIndex() {
    let w: number = this.getScroll().scrollLeft / percentToPixels(WIDTH) - 1;
    if (w < 0) w = 0;
    return Math.round(w);
  }

  // Action handlers ============================================================================================

  // Begin a scroll; creates additional listeners to allow it to be dragged outside of the narrow strip of scrolling pane.
  scrollStart(event: React.MouseEvent) {
    window.addEventListener(SELECT, this.block);
    window.addEventListener(M_DUR, this.scrollDur);
    window.addEventListener(M_END, this.scrollEnd);
    this.props.swapMouseX(event.screenX);
    this.mouseStart = event.screenX;
  }

  // Track mouse during a scroll
  scrollDur(event: MouseEvent) {
    if (this.detectMouse) {
      let newIndex: number;
      this.scrollFreeform(this.props.mouseX - event.screenX);
      this.props.swapMouseX(event.screenX);

      newIndex = this.selectNewIndex();
      if (newIndex !== this.props.selectedIndex)
        this.props.swapSelectedIndex(newIndex);
    }
    // Detect only every other mouseMove event
    this.detectMouse = !this.detectMouse;
  }

  // End the scroll, remove listeners, lock into proper position
  scrollEnd(event: MouseEvent) {
    window.removeEventListener(SELECT, this.block);
    window.removeEventListener(M_DUR, this.scrollDur);
    window.removeEventListener(M_END, this.scrollEnd);
    this.scrollLockNdx(this.selectNewIndex());
  }

  // Prevent selection of text while scrolling
  block(event: Event) {
    event.preventDefault();
  }

  // Handle clicks for the cards
  cardHandleClick(event: React.MouseEvent, index: number) {
    // Avoid detecting right-click
    if (event.type === "click") {
      if (Math.abs(this.mouseStart - this.props.mouseX) < CLICK_SENSITIVITY)
        if (this.props.selectedIndex === index)
          this.props.handleChange(this.props.allPossibleGoals[index].name);
        else this.scrollLockNdx(index);
    }
  }

  // Adds the keyboard listener
  keyboardListener(event: KeyboardEvent) {
    if (event.key === LEFT_KEY) {
      this.scrollLeft();
    } else if (event.key === RIGHT_KEY) {
      this.scrollRight();
    } else if (event.key === ENTER_KEY) {
      this.props.handleChange(
        this.props.allPossibleGoals[this.props.selectedIndex].name
      );
    }
  }

  // Adds the resize listener
  resizeListener(event: UIEvent) {
    this.centerUI(this.props.selectedIndex);
  }

  // Scrolling mechanics ===================================================================================

  // Scroll left one goal (w/ wrap)
  scrollLeft(): void {
    let newNdx = this.props.selectedIndex - 1;
    this.scrollLockNdx(
      newNdx < 0 ? this.props.allPossibleGoals.length - 1 : newNdx
    );
  }

  // Scroll right one goal (w/ wrap)
  scrollRight(): void {
    let newNdx =
      (this.props.selectedIndex + 1) % this.props.allPossibleGoals.length;
    this.scrollLockNdx(newNdx);
  }

  // Set this.props.selectedIndex and the current centered goal to a specified index
  scrollLockNdx(newIndex: number): void {
    this.props.swapSelectedIndex(newIndex);
    this.centerUI(newIndex);
  }

  // Centers the UI on the selected goal
  centerUI(centerIndex: number) {
    this.getScroll().scrollLeft = percentToPixels(WIDTH) * (centerIndex + 1);
  }

  // Scroll the pane freely w/o locking on to goals
  scrollFreeform(amount: number): void {
    var el: HTMLElement = this.getScroll();
    var newScrollLeft: number = el.scrollLeft + amount;
    var threshhold: number = percentToPixels(WRAP_AROUND_THRESHHOLD);

    if (newScrollLeft < threshhold)
      newScrollLeft =
        percentToPixels(this.TICKER_WIDTH) -
        percentToPixels(VIEW_WIDTH) +
        threshhold -
        1;
    else if (
      newScrollLeft >
      percentToPixels(this.TICKER_WIDTH) -
        percentToPixels(VIEW_WIDTH) +
        threshhold
    )
      newScrollLeft = threshhold + 1;
    el.scrollLeft = newScrollLeft;
  }

  // Returns the scroller; shorthand + facilitates testing in an environment where refs fail
  getScroll() {
    return this.scrollRef.current;
  }

  // Rendering functions ========================================================================================
  // Create the cards used to display the goals
  mapScrollCard(goal: Goal, index: number): ReactElement {
    return (
      <Card
        color={index === this.props.selectedIndex ? "secondary" : "default"}
        elevation={this.props.selectedIndex === index ? 7 : 1}
        id={SCROLL_CARD + index}
        key={index}
        style={this.chooseStyle(index)}
        // Menu
        onClick={(event: React.MouseEvent) => {
          this.cardHandleClick(event, index);
        }}
        onContextMenu={(event: React.MouseEvent) => {
          this.cardHandleClick(event, index);
        }}
      >
        <CardContent>
          <Typography variant="h6">
            <Translate id={goal.name + ".title"} />
          </Typography>
        </CardContent>

        <ContextMenu
          anchorName={SCROLL_CARD + index}
          options={[
            [
              "goal.selector.selectOption",
              () => {
                this.props.handleChange(
                  this.props.allPossibleGoals[index].name
                );
              },
            ],
          ]}
        />
      </Card>
    );
  }

  // Add a dummy card
  mapWraparoundCard(dummyGoal: [string, number, number], index: number) {
    return (
      <Card
        id={SCROLL_CARD + dummyGoal[2] + "Wraparound"}
        style={{ ...this.chooseStyle(dummyGoal[1]), justifyContent: "center" }}
        key={index + this.LENGTH}
        onClick={(event: React.MouseEvent) => {
          this.cardHandleClick(event, dummyGoal[1]);
        }}
        onContextMenu={(event: React.MouseEvent) => {
          this.cardHandleClick(event, dummyGoal[1]);
        }}
      >
        <CardContent>
          <Typography variant="h6">
            <Translate id={dummyGoal[0] + ".title"} />
          </Typography>
        </CardContent>

        <ContextMenu
          anchorName={SCROLL_CARD + dummyGoal[2] + "Wraparound"}
          options={[
            [
              "goal.selector.selectOption",
              () => {
                this.props.handleChange(
                  this.props.allPossibleGoals[dummyGoal[2]].name
                );
              },
            ],
          ]}
        />
      </Card>
    );
  }

  // Get the style for the cards based on its index
  chooseStyle(cardIndex: number) {
    if (cardIndex === this.props.selectedIndex) return this.style.selectedCard;
    else return this.style.inactiveCard;
  }

  render() {
    return (
      <div
        style={this.style.container as any}
        // Starts the drag event, then leaves it up to listeners created in scrollStart to see it through
        onMouseDown={(event: React.MouseEvent) => {
          this.scrollStart(event);
        }}
      >
        {/* Scroll left button */}
        <Button
          //style={styles.button}
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            this.scrollLeft();
          }}
        >
          <Typography variant={"h1"}>{"<"}</Typography>
        </Button>
        {/* Scroll pane */}
        <div
          ref={this.scrollRef}
          className={SCROLL_PANE}
          id={SCROLL_PANE}
          style={this.style.pane as any}
          tabIndex={0}
        >
          <div
            className={SCROLL_CONT}
            id={SCROLL_CONT}
            style={this.style.scroll as any}
          >
            {/* This is set up without lambdas because, as of the writing of this code,
            usage of lambdas completely broke the ui's scrolling for unknown reasons */}
            {this.LEAD_PADDING.map(this.mapWraparoundCard)}
            {this.props.allPossibleGoals.map(this.mapScrollCard)}
            {this.END_PADDING.map(this.mapWraparoundCard)}
          </div>
        </div>
        {/* Scroll right button */}
        <Button
          //style={styles.button}
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            this.scrollRight();
          }}
        >
          <Typography variant={"h1"}>{">"}</Typography>
        </Button>
      </div>
    );
  }
}

export function percentToPixels(scaleValue: number) {
  return (scaleValue / 100) * window.innerWidth;
}

export default withLocalize(GoalSelectorScroll);
