import * as React from "react";
import { Translate } from "react-localize-redux";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";

export interface CharacterStatusControlProps {
  character: string;
  accept: (character: string) => void;
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
          <Translate id="charInventory.characterSet.accept" />
        </Button>
        {/* <Button>Undecided</Button> */}
        <Button onClick={() => props.reject(props.character)}>
          <Translate id="charInventory.characterSet.reject" />
        </Button>
      </ButtonGroup>
    </React.Fragment>
  );
}
