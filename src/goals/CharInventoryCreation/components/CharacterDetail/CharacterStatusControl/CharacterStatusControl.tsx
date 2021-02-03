import { Button, ButtonGroup } from "@material-ui/core";
import * as React from "react";
import { Translate } from "react-localize-redux";

interface CharacterStatusControlProps {
  character: string;
  accept: (character: string) => void;
  unset: (character: string) => void;
  reject: (character: string) => void;
}

export default function CharacterStatusControl(
  props: CharacterStatusControlProps
) {
  return (
    <React.Fragment>
      <ButtonGroup
        variant="contained"
        size="small"
        aria-label="small outlined secondary button group"
      >
        <Button onClick={() => props.accept(props.character)}>
          <Translate id="buttons.accept" />
        </Button>
        <Button onClick={() => props.unset(props.character)}>
          <Translate id="buttons.undecided" />
        </Button>
        <Button onClick={() => props.reject(props.character)}>
          <Translate id="buttons.reject" />
        </Button>
      </ButtonGroup>
    </React.Fragment>
  );
}
