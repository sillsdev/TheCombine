import * as React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate
} from "react-localize-redux";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";

export interface CharacterStatusControlProps {
  character: string;
  accept: (character: string) => void;
  reject: (character: string) => void;
}

interface CharacterStatusControlState {}

export class CharacterStatusControl extends React.Component<
  CharacterStatusControlProps & LocalizeContextProps,
  CharacterStatusControlState
> {
  constructor(props: CharacterStatusControlProps & LocalizeContextProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <React.Fragment>
        <ButtonGroup
          variant="contained"
          size="small"
          aria-label="small outlined secondary button group"
        >
          <Button onClick={() => this.props.accept(this.props.character)}>
            <Translate id="charInventory.characterSet.accept" />
          </Button>
          {/* <Button>Undecided</Button> */}
          <Button onClick={() => this.props.reject(this.props.character)}>
            <Translate id="charInventory.characterSet.reject" />
          </Button>
        </ButtonGroup>
      </React.Fragment>
    );
  }
}

export default withLocalize(CharacterStatusControl);
