/* THIS COMPONENT IS INTENDED TO BE AN EXAMPLE ONLY. 
  IT WILL NOT BE USED IN THE APPLICATION.
*/

//external modules
import * as React from "react";
import {
  Translate,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";
import Button from "@material-ui/core/Button";

//interface for component props
export interface TempProps {
  text: string;
  buttonClicked?: () => void;
}

//interface for component state
interface TempState {}

class Temp extends React.Component<
  TempProps & LocalizeContextProps,
  TempState
> {
  constructor(props: TempProps & LocalizeContextProps) {
    super(props);

    this.state = { demo: "" };
  }

  render() {
    //extract text from props
    const { text } = this.props;

    //visual definition
    return (
      <div className="temp">
        <Translate id="temp.labelText" /> <br />
        {text} <Translate id="temp.wasPassedInFromStore" /> <br />
        <Button onClick={() => this.props.setActiveLanguage("es")}>
          <Translate id="temp.makeSpanish" />
        </Button>{" "}
        <br />
        <Button onClick={this.props.buttonClicked}>
          <Translate id="temp.buttonText" />
        </Button>
      </div>
    );
  }
}

//export class as default
export default withLocalize(Temp);
