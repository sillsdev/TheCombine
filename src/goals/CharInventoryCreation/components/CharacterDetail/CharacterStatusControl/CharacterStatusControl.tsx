import * as React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate
} from "react-localize-redux";
import Button from "@material-ui/core/Button";
import { ButtonGroup } from "@material-ui/core";

export interface CharacterStatusControlProps {
  character: string;
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
          color="secondary"
          size="large"
          aria-label="large outlined secondary button group"
        >
          <Button>Accept</Button>
          <Button>Undecided</Button>
          <Button>Reject</Button>
        </ButtonGroup>
      </React.Fragment>
    );
  }
}

export default withLocalize(CharacterStatusControl);
