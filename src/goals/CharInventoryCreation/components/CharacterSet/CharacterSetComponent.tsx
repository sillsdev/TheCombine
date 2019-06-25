import * as React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate
} from "react-localize-redux";
import { Grid, Typography, TextField, Button, Paper } from "@material-ui/core";
import { Delete as DeleteIcon, Add } from "@material-ui/icons";

export interface CharacterSetProps {
  setInventory: (inventory: string[]) => void;
  inventory: string[];
}

interface CharacterSetState {
  chars: string; // characters in the textbox
  selected: string[];
  dragChar: string;
  dropChar: string;
}

export class CharacterSet extends React.Component<
  CharacterSetProps & LocalizeContextProps,
  CharacterSetState
> {
  constructor(props: CharacterSetProps & LocalizeContextProps) {
    super(props);
    this.state = { chars: "", selected: [], dragChar: "", dropChar: "" };
  }

  handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    this.setState({ chars: e.target.value.replace(/\s/g, "") }); // removes whitespace
  }

  handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter") {
      this.addChars();
    }
  }

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
  addChars() {
    this.props.setInventory([
      ...this.props.inventory,
      ...this.state.chars.split("")
    ]);
    this.setState({
      chars: ""
    });
  }

  // deletes selected chraracters
  deleteSelected() {
    this.props.setInventory([
      ...this.props.inventory.filter(
        char => !this.state.selected.includes(char)
      )
    ]);
    this.setState({
      selected: []
    });
  }

  // reorders the character inventory by moving one char
  moveChar() {
    if (this.state.dragChar === this.state.dropChar) {
      this.setState({
        dragChar: "",
        dropChar: ""
      });
      return;
    }

    let inv = [...this.props.inventory];
    let dragIndex = inv.indexOf(this.state.dragChar);
    let dropIndex = inv.indexOf(this.state.dropChar);

    inv.splice(dragIndex, 1);
    inv.splice(dropIndex, 0, this.state.dragChar);

    this.setState({
      dragChar: "",
      dropChar: ""
    });
    this.props.setInventory(inv);
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
            <Translate id="charInventory.characterSet.title" />
          </Typography>
        </Grid>

        {this.props.inventory.length <= 0 ? (
          <Grid item xs={12}>
            <Typography variant="subtitle1" style={{ color: "#999" }}>
              <Translate id="charInventory.characterSet.noCharacters" />
            </Typography>
          </Grid>
        ) : (
          /* The grid of character tiles */
          this.props.inventory.map(char => [
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
              xs={1}
              onDragOver={e => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              key={"char_" + char}
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
                  onDragOver={e => {
                    if (this.state.dropChar !== char)
                      this.setState({ dropChar: char });
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

        {/* The text area for character input */}
        <Grid item xs={6}>
          <TextField
            value={this.state.chars}
            fullWidth
            variant="outlined"
            name="chracters"
            label={<Translate id="charInventory.characterSet.input" />}
            onChange={e => this.handleChange(e)}
            onKeyDown={e => this.handleKeyDown(e)}
          />
        </Grid>

        {/* The add characters and delete character buttons */}
        <Grid item xs={6}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => this.addChars()}
            title={
              this.props.translate(
                "charInventory.characterSet.addButtonTitle"
              ) as string
            }
            style={{ margin: 10 }} // remove when we can add theme
          >
            <Add /> <Translate id="charInventory.characterSet.addButton" />
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => this.deleteSelected()}
            disabled={this.state.selected.length === 0}
            title={
              this.props.translate(
                "charInventory.characterSet.deleteButtonTitle"
              ) as string
            }
            style={{ margin: 10 }}
          >
            <DeleteIcon />{" "}
            <Translate id="charInventory.characterSet.deleteButton" />
          </Button>
        </Grid>
      </Grid>
    );
  }
}

export default withLocalize(CharacterSet);
