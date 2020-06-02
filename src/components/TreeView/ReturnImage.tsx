import React, { Component, ReactNode } from "react";
import ReturnSymbol from "./images/ReturnSymbol.png";

interface ReturnImageProps {
  origin: Boolean;
}
interface ReturnImageState {
  content: ReactNode;
}

export default class ReturnImage extends Component<
  ReturnImageProps,
  ReturnImageState
> {
  constructor(props: ReturnImageProps) {
    super(props);
    if (this.props.origin) {
      this.state = {
        content: <div></div>,
      };
    } else {
      this.state = {
        content: (
          <div>
            <img
              src={ReturnSymbol}
              alt="Return Symbol"
              width="40px"
              height="auto"
            />
          </div>
        ),
      };
    }
  }

  render() {
    return <div>{this.state.content}</div>;
  }
}
