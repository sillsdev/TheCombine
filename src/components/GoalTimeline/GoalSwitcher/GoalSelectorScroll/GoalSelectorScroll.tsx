import React, { ReactElement } from "react";

import Card from "@material-ui/core/Card";
import { Button, CardContent, Menu, MenuItem } from "@material-ui/core";
import { Goal } from "../../../../types/goals";
import {
  LocalizeContextProps,
  withLocalize,
  Translate
} from "react-localize-redux";
import ContextMenu from "../../../ContextMenu/ContextMenu";

const CLICK_SENSITIVITY: number = 10;

// Defines relations of scroller to allow resizing
const NUM_PANES: number = 5; // Number of panes present in the ui. Must be odd
export const WIDTH: number = 200; // Width of each card
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
const PADDING: number = 10;
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
  handleChange: (value: string) => void;
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
      display: "flex",
      flexWrap: "nowrap",
      overflow: "hidden"
    },
    pane: {
      padding: PADDING,
      userselect: "none",
      display: "flex",
      flexWrap: "nowrap",
      overflow: "hidden",
      width: VIEW_WIDTH
    },
    scroll: {
      flexWrap: "nowrap",
      display: "flex"
    },
    selectedCard: {
      width: WIDTH,
      backgroundColor: "white"
    },
    inactiveCard: {
      width: DESELECTED_WIDTH,
      margin: (WIDTH - DESELECTED_WIDTH) / 2,
      backgroundColor: "lightGray",
      color: "gray"
    }
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
          index + this.LENGTH - AMT_OF_PADDING
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
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.keyboardListener);
  }

  // Chooses an index based on the screen's current scroll
  selectNewIndex() {
    let w: number = this.getScroll().scrollLeft / WIDTH - 1;
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
      if (newIndex != this.props.selectedIndex)
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
    if (event.type == "click") {
      if (Math.abs(this.mouseStart - this.props.mouseX) < CLICK_SENSITIVITY)
        if (this.props.selectedIndex == index)
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
    this.getScroll().scrollLeft = WIDTH * (centerIndex + 1);
  }

  // Scroll the pane freely w/o locking on to goals
  scrollFreeform(amount: number): void {
    var el: HTMLElement = this.getScroll();
    var newScrollLeft = el.scrollLeft + amount;
    if (newScrollLeft < WRAP_AROUND_THRESHHOLD)
      newScrollLeft =
        this.TICKER_WIDTH - VIEW_WIDTH + WRAP_AROUND_THRESHHOLD - 1;
    else if (
      newScrollLeft >
      this.TICKER_WIDTH - VIEW_WIDTH + WRAP_AROUND_THRESHHOLD
    )
      newScrollLeft = WRAP_AROUND_THRESHHOLD + 1;
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
        className={SCROLL_CARD + index}
        key={index}
        style={this.chooseStyle(index)}
        elevation={this.props.selectedIndex === index ? 7 : 1}
        // Menu
        onClick={(event: React.MouseEvent) => {
          this.cardHandleClick(event, index);
        }}
        onContextMenu={(event: React.MouseEvent) => {
          this.cardHandleClick(event, index);
        }}
      >
        <CardContent>
          <Translate id={"goal.name." + goal.name} />
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
              }
            ]
          ]}
        />
      </Card>
    );
  }

  // Add a dummy card
  mapWraparoundCard(dummyGoal: [string, number, number], index: number) {
    return (
      <Card
        className={SCROLL_CARD + dummyGoal[2] + "Wraparound"}
        style={this.chooseStyle(dummyGoal[1])}
        key={index + this.LENGTH}
        onClick={(event: React.MouseEvent) => {
          this.cardHandleClick(event, dummyGoal[1]);
        }}
        onContextMenu={(event: React.MouseEvent) => {
          this.cardHandleClick(event, dummyGoal[1]);
        }}
      >
        <CardContent>
          <Translate id={"goal.name." + dummyGoal[0]} />
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
              }
            ]
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
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            this.scrollLeft();
          }}
        >
          {"<"}
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
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            this.scrollRight();
          }}
        >
          {">"}
        </Button>
      </div>
    );
  }
}

export default withLocalize(GoalSelectorScroll);
