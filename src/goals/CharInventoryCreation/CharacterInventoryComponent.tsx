import * as React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate
} from "react-localize-redux";
import CharacterList from "./components/CharacterList";
import {
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@material-ui/core";
import { Project } from "../../types/project";
import SampleWords from "./components/SampleWords";
import { Save } from "@material-ui/icons";
import history from "../../history";
import CharacterEntry from "./components/CharacterEntry";
import CharacterSetHeader from "./components/CharacterList/CharacterSetHeader";
import CharacterDetail from "./components/CharacterDetail";
import { listChar } from "./CharacterInventoryReducer";

export interface CharacterInventoryProps {
  addToValidCharacters: (chars: string[]) => void;
  setValidCharacters: (inventory: string[]) => void;
  setRejectedCharacters: (inventory: string[]) => void;
  setSelectedCharacter: (character: string) => void;
  uploadInventory: () => void;
  fetchWords: () => void;
  validCharacters: string[];
  rejectedCharacters: string[];
  currentProject: Project;
  selectedCharacter: string;
  getAllCharacters: (
    validCharacters: string[],
    rejectedCharacters: string[]
  ) => Promise<void>;
  allCharacters: listChar[];
}

export const SAVE: string = "pushGoals";
export const CANCEL: string = "cancelInventoryCreation";

interface CharacterInventoryState {
  cancelDialogOpen: boolean;
}

export class CharacterInventory extends React.Component<
  CharacterInventoryProps & LocalizeContextProps,
  CharacterInventoryState
> {
  constructor(props: CharacterInventoryProps & LocalizeContextProps) {
    super(props);
    this.state = { cancelDialogOpen: false };
  }

  componentDidMount() {
    this.props.fetchWords();
    this.props.setValidCharacters(this.props.currentProject.validCharacters);
    this.props.setRejectedCharacters(
      this.props.currentProject.rejectedCharacters
    );
    this.props
      .getAllCharacters(
        this.props.validCharacters,
        this.props.rejectedCharacters
      )
      .then(() => console.log(this.props.allCharacters));
    this.props.setSelectedCharacter("");
  }

  handleClose() {
    this.setState({ cancelDialogOpen: false });
  }

  render() {
    return (
      <div>
        <Grid
          container
          justify="center"
          spacing={2}
          style={{ background: "#fff" }}
        >
          <Grid item sm={9} xs={12} style={{ borderRight: "1px solid #ccc" }}>
            <Grid
              container
              spacing={2}
              direction="row"
              justify="flex-start"
              alignItems="center"
            >
              <CharacterSetHeader />
              {/* This component doesn't work with the new structure of the character inventory */}
              {/* <CharacterEntry /> */}
              <CharacterList />
            </Grid>
          </Grid>

          <Grid item sm={3} xs={12}>
            {this.props.selectedCharacter === "" ? (
              // <SampleWords
              //   addToValidCharacters={this.props.addToValidCharacters}
              //   allCharacters={this.props.validCharacters.concat(
              //     this.props.rejectedCharacters
              //   )}
              // />
              <React.Fragment />
            ) : (
              <CharacterDetail
                character={this.props.selectedCharacter}
                close={() => this.props.setSelectedCharacter("")}
              />
            )}
          </Grid>

          <Grid item xs={12} style={{ borderTop: "1px solid #ccc" }}>
            {/* submission buttons */}
            <Grid container justify="center">
              <Button
                id={SAVE}
                variant="contained"
                color="primary"
                onClick={() => {
                  this.props.uploadInventory();
                  history.push("/goals");
                }}
                style={{ margin: 10 }} // remove when we can add theme
              >
                <Save /> <Translate id="charInventory.save" />
              </Button>
              <Button
                id={CANCEL}
                variant="contained"
                onClick={() => {
                  this.setState({ cancelDialogOpen: true });
                }}
                style={{ margin: 10 }} // remove when we can add theme
              >
                {" "}
                <Translate id="charInventory.cancel" />
              </Button>
            </Grid>
          </Grid>
        </Grid>

        {/* "Are you sure?" dialog for the cancel button */}
        <Dialog
          open={this.state.cancelDialogOpen}
          onClose={() => this.handleClose()}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            <Translate id="charInventory.dialog.title" />
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <Translate id="charInventory.dialog.content" />
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => history.push("/goals")}
              variant="contained"
              color="secondary"
              autoFocus
            >
              <Translate id="charInventory.dialog.yes" />
            </Button>
            <Button onClick={() => this.handleClose()} color="primary">
              <Translate id="charInventory.dialog.no" />
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default withLocalize(CharacterInventory);
