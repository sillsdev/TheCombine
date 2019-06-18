import React, { ReactElement } from "react";

import Card from "@material-ui/core/Card";
import { Button } from "@material-ui/core";
import { Goal } from "../../../../types/goals";
import {
  LocalizeContextProps,
  withLocalize,
  Translate
} from "react-localize-redux";

export const WIDTH: number = 200;
export const VIEW_WIDTH: number = WIDTH * 3;
const MARGIN: number = 0;
const SELECT_COL = "cyan";

const SELECT = "selectstart";
const M_DUR = "mousemove";
const M_END = "mouseup";

// classNames
export const SCROLL_PANE: string = "scrollPane";
export const SCROLL_CONT: string = "scrollCont";
export const SCROLL_CARD: string = "scrollCard";
const PADDING: number = 10;

export interface GoalSelectorScrollProps {
  goalOptions: Goal[];
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
      display: "flex",
      width: this.getTickerWidth()
    },
    cardNormal: {
      width: WIDTH
    },
    cardSelect: {
      width: WIDTH,
      backgroundColor: SELECT_COL
    },
    cardWhitespace: {
      width: WIDTH,
      opacity: 0.01
    }
  };

  scrollRef: any;

  constructor(props: GoalSelectorScrollProps & LocalizeContextProps) {
    super(props);

    // Bind so as to be able to be used as event listeners/map function
    this.scrollDur = this.scrollDur.bind(this);
    this.scrollEnd = this.scrollEnd.bind(this);
    this.renderMapHelper = this.renderMapHelper.bind(this);
    this.scrollRef = React.createRef();
  }

  // Updates the position of the ticker upon mounting to override odd FireFox behavior
  componentDidMount() {
    try {
      this.getScroll().scrollLeft = 0;
    } catch (err) {
      // This block is only reached in a testing environment where the refs fail for reasons not currently understood. In
      // deployment, this block would never be reached (as under React's documentation, refs are guaranteed to work by the
      // time componentDidMount is called). Thus, this is a temporary solution to the tests not allowing refs to work
    }
  }

  // Creates and returns a single scrollCard based off of index
  renderMapHelper(goal: Goal, index: number, array: Goal[]): ReactElement {
    return this.scrollCard(index, this.style);
  }

  // Chooses an index based on the screen's current scroll
  selectNewIndex() {
    let w: number = this.getScroll().scrollLeft / WIDTH;
    if (w < 0) w += this.props.goalOptions.length;
    return Math.round(w);
  }

  // Pane scroll functions

  // Begin a scroll; creates additional listeners to allow it to be dragged outside of the narrow strip of scrolling pane.
  scrollStart(event: any) {
    window.addEventListener(SELECT, this.block);
    window.addEventListener(M_DUR, this.scrollDur);
    window.addEventListener(M_END, this.scrollEnd);
    this.props.swapMouseX(event.screenX);
  }

  // Track mouse during a scroll
  scrollDur(event: any) {
    this.scrollFreeform(this.props.mouseX - event.screenX);
    this.props.swapMouseX(event.screenX);
    this.props.swapSelectedIndex(this.selectNewIndex());
  }

  // End the scroll, remove listeners, lock into proper position
  scrollEnd(event: any) {
    window.removeEventListener(SELECT, this.block);
    window.removeEventListener(M_DUR, this.scrollDur);
    window.removeEventListener(M_END, this.scrollEnd);
    this.scrollLockNdx(this.selectNewIndex());
  }

  // Prevent selection of text while scrolling
  block(event: Event) {
    event.preventDefault();
  }

  // A lot of functions which handle the actual mechanics of scrolling

  // Scroll left one goal (w/ wrap)
  scrollLeft(): void {
    let newNdx = this.props.selectedIndex - 1;
    this.scrollLockNdx(newNdx < 0 ? this.props.goalOptions.length - 1 : newNdx);
  }

  // Scroll right one goal (w/ wrap)
  scrollRight(): void {
    let newNdx = (this.props.selectedIndex + 1) % this.props.goalOptions.length;
    this.scrollLockNdx(newNdx);
  }

  // Set this.props.selectedIndex and the current centered goal to a specified index
  scrollLockNdx(newIndex: number): void {
    this.props.swapSelectedIndex(newIndex);
    this.scrollToIndex(newIndex);
  }

  // Scroll to a specified new index
  scrollToIndex(newIndex: number): void {
    this.getScroll().scrollLeft = WIDTH * newIndex;
  }

  // Scroll the pane freely w/o locking on to goals
  scrollFreeform(amount: number): void {
    var el: HTMLElement = this.getScroll();
    var newScrollLeft = el.scrollLeft + amount;
    if (newScrollLeft < 0)
      newScrollLeft += this.getTickerWidth() - VIEW_WIDTH - PADDING - 1;
    else if (
      newScrollLeft >
      this.getTickerWidth() - VIEW_WIDTH - PADDING + MARGIN
    )
      newScrollLeft = 1;
    el.scrollLeft = newScrollLeft;
  }

  // Get the scrolling pane itself
  getScroll(): HTMLElement {
    return this.scrollRef.current;
  }

  // Get the width of the scrolling component
  getTickerWidth(): number {
    return WIDTH * (this.props.goalOptions.length + 2);
  }

  // End of scrolling mechanic functions

  // Create the cards used to display the goals
  // For later: add in a change-color effect on mouse hover for the currently selected card to help indicate you can click on it
  scrollCard(index: number, style: any): ReactElement {
    return (
      <Card
        className={SCROLL_CARD}
        key={index}
        style={
          this.props.selectedIndex == index
            ? style.cardSelect
            : style.cardNormal
        }
        elevation={this.props.selectedIndex == index ? 7 : 1}
        onDoubleClick={() => {
          if (this.props.selectedIndex == index)
            this.props.handleChange(this.props.goalOptions[index].name);
        }}
      >
        <Translate id={"goal.name." + this.props.goalOptions[index].name} />
      </Card>
    );
  }

  render() {
    return (
      <div
        style={this.style.container as any}
        // Starts the drag event, then leaves it up to listeners created in scrollStart to see it through
        onMouseDown={(event: any) => {
          this.scrollStart(event);
        }}
      >
        {/* Scroll left button */}
        <Button
          onClick={(e: any) => {
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
        >
          <div
            className={SCROLL_CONT}
            id={SCROLL_CONT}
            style={this.style.scroll as any}
          >
            {/* Empty cards create whitespace at ends to allow for proper scrolling */}
            <Card style={this.style.cardWhitespace} />
            {this.props.goalOptions.map(this.renderMapHelper)}
            <Card style={this.style.cardWhitespace} />
          </div>
        </div>
        {/* Scroll right button */}
        <Button
          onClick={(e: any) => {
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
