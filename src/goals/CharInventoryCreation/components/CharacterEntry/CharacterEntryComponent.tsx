import * as React from "react";
import { Translate } from "react-localize-redux";
import { Grid, Collapse, Button } from "@material-ui/core";
import { KeyboardArrowDown } from "@material-ui/icons";

import CharactersInput from "goals/CharInventoryCreation/components/CharacterEntry/CharactersInput";
import theme from "types/theme";

interface CharacterEntryProps {
  setValidCharacters: (inventory: string[]) => void;
  validCharacters: string[];
  setRejectedCharacters: (inventory: string[]) => void;
  rejectedCharacters: string[];
}

interface CharacterEntryState {
  checked: boolean;
}

/**
 * Allows for viewing and entering accepted and rejected characters in a
 * character set
 */
export default class CharacterEntry extends React.Component<
  CharacterEntryProps,
  CharacterEntryState
> {
  constructor(props: CharacterEntryProps) {
    super(props);
    this.state = {
      checked: false,
    };
  }

  render() {
    return (
      <React.Fragment>
        <Grid item xs={12}>
          <Grid
            container
            style={{
              padding: theme.spacing(1),
              background: "whitesmoke",
              borderTop: "1px solid #ccc",
            }}
            spacing={2}
          >
            <Button
              onClick={() =>
                this.setState((prevState) => ({ checked: !prevState.checked }))
              }
            >
              <Translate id="charInventory.characterSet.advanced" />{" "}
              <KeyboardArrowDown
                style={{
                  transform: this.state.checked
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  transition: "all 200ms",
                }}
              />
            </Button>
            <Collapse in={this.state.checked} style={{ width: "100%" }}>
              {/* Input for accepted characters */}
              <Grid item xs={12}>
                <CharactersInput
                  characters={this.props.validCharacters}
                  setCharacters={(chars) =>
                    this.props.setValidCharacters(chars)
                  }
                  label={
                    <Translate id="charInventory.characterSet.acceptedCharacters" />
                  }
                  id="valid-characters-input"
                />
              </Grid>

              {/* Input for rejected characters */}
              <Grid item xs={12}>
                <CharactersInput
                  characters={this.props.rejectedCharacters}
                  setCharacters={(chars) =>
                    this.props.setRejectedCharacters(chars)
                  }
                  label={
                    <Translate id="charInventory.characterSet.rejectedCharacters" />
                  }
                  id="rejected-characters-input"
                />
              </Grid>
            </Collapse>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}
