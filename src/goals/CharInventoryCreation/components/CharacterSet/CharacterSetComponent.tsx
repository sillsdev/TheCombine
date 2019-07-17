import * as React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate
} from "react-localize-redux";
import { Grid, Typography, TextField, Tooltip } from "@material-ui/core";
import { Help } from "@material-ui/icons";
import theme from "../../../../types/theme";
import { red, green } from "@material-ui/core/colors";

export interface CharacterSetProps {
  setValidCharacters: (inventory: string[]) => void;
  validCharacters: string[];
  setRejectedCharacters: (inventory: string[]) => void;
  rejectedCharacters: string[];
}

interface CharacterSetState {
  hoverChar: string;
  dragChar: string;
  dropChar: string;
}

export class CharacterSet extends React.Component<
  CharacterSetProps & LocalizeContextProps,
  CharacterSetState
> {
  constructor(props: CharacterSetProps & LocalizeContextProps) {
    super(props);
    this.state = {
      hoverChar: "",
      dragChar: "",
      dropChar: ""
    };
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

        {this.props.validCharacters.length <= 0 &&
        this.props.rejectedCharacters.length <= 0 ? (
          <Grid item xs={12}>
            <Typography variant="subtitle1" style={{ color: "#999" }}>
              <Translate id="charInventory.characterSet.noCharacters" />
            </Typography>
          </Grid>
        ) : (
          <React.Fragment>
            {/* The grid of character tiles */
            this.props.validCharacters.map((char, index) => (
              <Grid
                item
                sm={1}
                xs={2}
                key={"char_" + char}
                style={{ paddingBottom: 0 }}
                onDragOver={e => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (this.state.dropChar !== char)
                    this.setState({ dropChar: char });
                }}
              >
                <Grid container justify="center">
                  <div
                    id={"charTile_" + char}
                    style={{
                      position: "relative",
                      border: "4px solid " + green[100],
                      borderRadius: "50%",
                      width: 40,
                      height: 40,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer"
                    }}
                    onMouseEnter={() => this.setState({ hoverChar: char })}
                    onMouseLeave={() => this.setState({ hoverChar: "" })}
                    onClick={() => {
                      this.props.setRejectedCharacters(
                        this.props.rejectedCharacters.concat(char)
                      );
                      this.setState({
                        hoverChar: this.props.validCharacters[index + 1]
                          ? this.props.validCharacters[index + 1]
                          : ""
                      });
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
                  >
                    <Typography variant="h6">{char}</Typography>
                  </div>
                  <Typography
                    variant="subtitle2"
                    style={{ opacity: this.state.hoverChar === char ? 1 : 0 }}
                  >
                    Accepted
                  </Typography>
                </Grid>
              </Grid>
            ))}
            {this.props.rejectedCharacters.map(char => (
              <Grid
                item
                sm={1}
                xs={2}
                key={"char_" + char}
                style={{ paddingBottom: 0 }}
              >
                <Grid container justify="center">
                  <div
                    id={"charTile_" + char}
                    style={{
                      position: "relative",
                      border: "4px solid " + red[100],
                      borderRadius: "50%",
                      width: 40,
                      height: 40,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer"
                    }}
                    onMouseEnter={() => this.setState({ hoverChar: char })}
                    onMouseLeave={() => this.setState({ hoverChar: "" })}
                    onClick={() =>
                      this.props.setValidCharacters(
                        this.props.validCharacters.concat(char)
                      )
                    }
                  >
                    <Typography variant="h6">{char}</Typography>
                  </div>
                  <Typography
                    variant="subtitle2"
                    style={{ opacity: this.state.hoverChar === char ? 1 : 0 }}
                  >
                    Rejected
                  </Typography>
                </Grid>
              </Grid>
            ))}
          </React.Fragment>
        )}

        <Grid item xs={12}>
          <Grid
            container
            style={{
              padding: theme.spacing(1),
              background: "whitesmoke",
              borderTop: "1px solid #ccc"
            }}
            spacing={2}
          >
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
                autoComplete="off"
                inputProps={{
                  style: { letterSpacing: 5 },
                  spellcheck: "false"
                }}
                style={{ maxWidth: 512 }}
              />
            </Grid>

            {/* Input for rejected characters */}
            <Grid item xs={12} style={{ background: "whitesmoke" }}>
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
                autoComplete="off"
                inputProps={{
                  style: { letterSpacing: 5 },
                  spellcheck: "false"
                }}
                style={{ maxWidth: 512 }}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default withLocalize(CharacterSet);
