import * as React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate
} from "react-localize-redux";
import { Grid, Typography, TextField, Paper, Tooltip } from "@material-ui/core";
import { Help } from "@material-ui/icons";

export interface CharacterSetProps {
  setValidCharacters: (inventory: string[]) => void;
  validCharacters: string[];
  setRejectedCharacters: (inventory: string[]) => void;
  rejectedCharacters: string[];
}

interface CharacterSetState {
  chars: string; // characters in the textbox
  selected: string[];
  dragChar: string;
  dropChar: string;
  textboxError: boolean;
}

export class CharacterSet extends React.Component<
  CharacterSetProps & LocalizeContextProps,
  CharacterSetState
> {
  constructor(props: CharacterSetProps & LocalizeContextProps) {
    super(props);
    this.state = {
      chars: "",
      selected: [],
      dragChar: "",
      dropChar: "",
      textboxError: false
    };
  }

  handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    this.props.setValidCharacters(e.target.value.replace(/\s/g, "").split(""));
    // this.setState({
    //   chars: e.target.value.replace(/\s/g, ""),
    //   textboxError: false
    // }); // removes whitespace
  }

  // handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
  //   if (e.key === "Enter") {
  //     this.addChars();
  //   }
  // }

  // toggles selection (for deletion) of a character
  toggleSelected(char: string) {
    let selected = this.state.selected;
    let index = selected.indexOf(char);

    if (index === -1) {
      selected.push(char);
    } else {
      selected.splice(index, 1);
    }

    this.setState({
      selected
    });
  }

  // adds characters in the textbox to the inventory
  // addChars() {
  //   if (this.state.chars === "") {
  //     this.setState({ textboxError: true });
  //   } else {
  //     this.props.setInventory([
  //       ...this.props.inventory,
  //       ...this.state.chars.split("")
  //     ]);
  //     this.setState({
  //       chars: ""
  //     });
  //   }
  // }

  // deletes selected chraracters
  // deleteSelected() {
  //   this.props.setValidCharacters([
  //     ...this.props.validCharacters.filter(
  //       char => !this.state.selected.includes(char)
  //     )
  //   ]);
  //   this.setState({
  //     selected: []
  //   });
  // }

  // reorders the character inventory by moving one char
  moveChar() {
    if (this.state.dragChar === this.state.dropChar) {
      this.setState({
        dragChar: "",
        dropChar: ""
      });
      return;
    }

    let inv = [...this.props.validCharacters];
    let dragIndex = inv.indexOf(this.state.dragChar);
    let dropIndex = inv.indexOf(this.state.dropChar);

    inv.splice(dragIndex, 1);

    if (dragIndex >= dropIndex) {
      inv.splice(dropIndex, 0, this.state.dragChar);
    } else {
      inv.splice(dropIndex - 1, 0, this.state.dragChar);
    }

    this.setState({
      dragChar: "",
      dropChar: ""
    });
    this.props.setValidCharacters(inv);
  }

  render() {
    return (
      <Grid
        container
        spacing={2}
        direction="row"
        justify="flex-start"
        alignItems="center"
      >
        <Grid item xs={12}>
          <Typography component="h1" variant="h4">
            <Translate id="charInventory.characterSet.title" />{" "}
            <Tooltip
              title={
                this.props.translate(
                  "charInventory.characterSet.help"
                ) as string
              }
              placement="right"
            >
              <Help />
            </Tooltip>
          </Typography>
        </Grid>

        {this.props.validCharacters.length <= 0 ? (
          <Grid item xs={12}>
            <Typography variant="subtitle1" style={{ color: "#999" }}>
              <Translate id="charInventory.characterSet.noCharacters" />
            </Typography>
          </Grid>
        ) : (
          /* The grid of character tiles */
          this.props.validCharacters.map(char => [
            this.state.dropChar === char && this.state.dragChar !== char ? (
              <Grid
                item
                xs={1}
                onDragOver={e => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
              />
            ) : null, // Creates a blank space where the tile will be dropped
            <Grid
              item
              sm={1}
              xs={2}
              key={"char_" + char}
              onDragOver={e => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (this.state.dropChar !== char)
                  this.setState({ dropChar: char });
              }}
            >
              <Grid container justify="center">
                <Paper
                  id={"charTile_" + char}
                  style={{
                    minWidth: 20,
                    textAlign: "center",
                    padding: "5px 10px",
                    cursor: "pointer",
                    background: this.state.selected.includes(char)
                      ? "#fcc"
                      : "#fff"
                  }}
                  draggable={true}
                  onDragStart={e => {
                    this.setState({ dragChar: char });
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={e => {
                    e.preventDefault();
                    this.moveChar();
                  }}
                  onClick={() => this.toggleSelected(char)}
                >
                  {char}
                </Paper>
              </Grid>
            </Grid>
          ])
        )}

        <Grid item xs={12} />

        {/* Input for accepted characters */}
        <Grid item xs={12}>
          <TextField
            value={this.props.validCharacters.join("")}
            fullWidth
            variant="outlined"
            name="chracters"
            label={
              <Translate id="charInventory.characterSet.acceptedCharacters" />
            }
            onChange={e =>
              this.props.setValidCharacters(
                e.target.value.replace(/\s/g, "").split("")
              )
            }
            // onKeyDown={e => this.handleKeyDown(e)}
            autoComplete="off"
            inputProps={{ style: { letterSpacing: 5 }, spellcheck: "false" }}
          />
        </Grid>

        {/* Input for rejected characters */}
        <Grid item xs={12}>
          <TextField
            value={this.props.rejectedCharacters.join("")}
            fullWidth
            variant="outlined"
            name="chracters"
            label={
              <Translate id="charInventory.characterSet.rejectedCharacters" />
            }
            onChange={e =>
              this.props.setRejectedCharacters(
                e.target.value.replace(/\s/g, "").split("")
              )
            }
            // onKeyDown={e => this.handleKeyDown(e)}
            autoComplete="off"
            inputProps={{ style: { letterSpacing: 5 }, spellcheck: "false" }}
          />
        </Grid>
      </Grid>
    );
  }
}

export default withLocalize(CharacterSet);
