//external modules
import * as React from "react";
import Button from "@material-ui/core/Button";

//additional files
import "./Temp.css";

//interface for component props
export interface TempProps {
  text: string;
  buttonClicked?: () => void;
}

//interface for component state
interface TempState {}

class Temp extends React.Component<TempProps, TempState> {
  constructor(props: TempProps) {
    super(props);

    this.state = { demo: "" };
  }

  render() {
    //extract text from props
    const { text } = this.props;

    //visual definition
    return (
      <div className="temp">
        {text} was passed into this test object. <br />
        <Button onClick={this.props.buttonClicked}>{this.props.text}</Button>
      </div>
    );
  }
}

//export class as default
export default Temp;
