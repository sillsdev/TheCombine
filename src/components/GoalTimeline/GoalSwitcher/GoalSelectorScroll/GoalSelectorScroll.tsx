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
export const SCROLL_ROOT: string = "scrollRoot";
export const B_LEFT: string = "leftArrow";
export const B_RIGHT: string = "rightArrow";
export const SCROLL_PANE: string = "scrollPane";
export const SCROLL_CONT: string = "scrollCont";
export const SCROLL_CARD: string = "scrollCard";
const PADDING: number = 10;

export interface GoalSelectorScrollProps {
  goalOptions: Goal[];
  ndx: number;
  iX: number;
  end: number;
  swapNdx: (ndx: number) => void;
  swapIX: (iX: number) => void;
  handleChange: (value: string) => void;
  //   event: React.ChangeEvent<{ name?: string; value: unknown }>
  // ) => void;
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

  render() {
    return (
      <div
        className={SCROLL_ROOT}
        style={this.style.container as any}
        // Starts the drag event, then leaves it up to listeners created in scrollStart to see it through
        onMouseDown={(event: any) => {
          this.scrollStart(event);
        }}
      >
        {/* Scroll left button */}
        <Button
          className={B_LEFT}
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
            <Card style={this.style.cardNormal} />
            {this.props.goalOptions.map(this.renderMapHelper)}
            <Card style={this.style.cardNormal} />
          </div>
        </div>
        {/* Scroll right button */}
        <Button
          className={B_RIGHT}
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

  // Updates the position of the ticker upon mounting to override odd FireFox behavior
  componentDidMount() {
    try {
      this.getScroll().scrollLeft = 0;
    } catch (ex) {
      // Scroll not mounted, don't crash it
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
    this.props.swapIX(event.screenX);
  }

  // Track during a scroll
  scrollDur(event: any) {
    this.scrollFreeform(this.props.iX - event.screenX);
    this.props.swapIX(event.screenX);
    this.props.swapNdx(this.selectNewIndex());
  }

  // End the scroll, remove listeners, lock into proper position
  scrollEnd(event: any) {
    window.removeEventListener(SELECT, this.block);
    window.removeEventListener(M_DUR, this.scrollDur);
    window.removeEventListener(M_END, this.scrollEnd);
    this.scrollLockNdx(this.selectNewIndex());
  }

  // A lot of scrolling functions

  // Scroll left one goal (w/ wrap)
  scrollLeft(): void {
    let newNdx = this.props.ndx - 1;
    this.scrollLockNdx(newNdx < 0 ? this.props.goalOptions.length - 1 : newNdx);
  }

  // Scroll right one goal (w/ wrap)
  scrollRight(): void {
    let newNdx = (this.props.ndx + 1) % this.props.goalOptions.length;
    this.scrollLockNdx(newNdx);
  }

  // Set this.props.ndx and the current centered goal to ndx
  scrollLockNdx(ndx: number): void {
    this.props.swapNdx(ndx);
    this.scrollToIndex(ndx);
  }

  // Scroll to a specified index
  scrollToIndex(ndx: number): void {
    this.getScroll().scrollLeft = WIDTH * ndx;
  }

  // Scroll the pane freely w/o locking on to goals
  scrollFreeform(amt: number): void {
    var el: HTMLElement = this.getScroll();
    var newL = el.scrollLeft + amt;
    if (newL < 0) newL += this.getTickerWidth() - VIEW_WIDTH - PADDING - 1;
    else if (newL > this.getTickerWidth() - VIEW_WIDTH - PADDING + MARGIN)
      newL = 1;
    el.scrollLeft = newL;
  }

  // Get the scrolling pane
  getScroll(): HTMLElement {
    return this.scrollRef.current;
  }

  // Get the width of the scrolling component
  getTickerWidth(): number {
    return (
      WIDTH * (this.props.goalOptions.length + 2) // +
      //PADDING * (this.props.goalOptions.length + 3)
    );
  }

  // End of scrolling functions

  // Create the cards used by the scrolling pane
  scrollCard(index: number, style: any): ReactElement {
    return (
      <Card
        className={SCROLL_CARD}
        key={index}
        style={this.props.ndx == index ? style.cardSelect : style.cardNormal}
        elevation={this.props.ndx == index ? 7 : 1}
        onDoubleClick={() => {
          if (this.props.ndx == index)
            this.props.handleChange(this.props.goalOptions[index].name);
        }}
      >
        <Translate id={"goal.name." + this.props.goalOptions[index].name} />
      </Card>
    );
  }

  // Prevent selection of text while scrolling
  block(event: Event) {
    event.preventDefault();
  }
}

export default withLocalize(GoalSelectorScroll);
