import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
} from "@material-ui/core";
import { Save } from "@material-ui/icons";
import * as React from "react";
import {
  withLocalize,
  LocalizeContextProps,
  Translate,
} from "react-localize-redux";

import history, { Path } from "../../history";
import { Project } from "../../types/project";
import theme from "../../types/theme";
import { CharacterSetEntry } from "./CharacterInventoryReducer";
import CharacterDetail from "./components/CharacterDetail";
import CharacterEntry from "./components/CharacterEntry";
import CharacterList from "./components/CharacterList";
import CharacterSetHeader from "./components/CharacterList/CharacterSetHeader";

export interface CharacterInventoryProps {
  setValidCharacters: (inventory: string[]) => void;
  setRejectedCharacters: (inventory: string[]) => void;
  setSelectedCharacter: (character: string) => void;
  uploadInventory: () => void;
  fetchWords: () => void;
  currentProject: Project;
  selectedCharacter: string;
  getAllCharacters: () => Promise<void>;
  allCharacters: CharacterSetEntry[];
}

export const SAVE: string = "pushGoals";
export const CANCEL: string = "cancelInventoryCreation";

interface CharacterInventoryState {
  cancelDialogOpen: boolean;
}

/**
 * Allows users to define a character inventory for a project
 */
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
    this.props.getAllCharacters();
    this.props.setSelectedCharacter("");
  }

  handleClose() {
    this.setState({ cancelDialogOpen: false });
  }

  render() {
    return (
      <div>
        <Grid container justify="center" spacing={2}>
          <Grid item xl={10} lg={9} md={8} xs={12}>
            <Grid
              container
              spacing={2}
              direction="row"
              justify="flex-start"
              alignItems="center"
            >
              <CharacterSetHeader />
              <CharacterEntry />
              <CharacterList />
            </Grid>
          </Grid>

          <Grid item xl={2} lg={3} md={4} xs={12}>
            {this.props.selectedCharacter === "" ? (
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
                  history.push(Path.Goals);
                }}
                style={{ margin: theme.spacing(1) }}
              >
                <Save /> <Translate id="buttons.save" />
              </Button>
              <Button
                id={CANCEL}
                variant="contained"
                onClick={() => {
                  this.setState({ cancelDialogOpen: true });
                }}
                style={{ margin: theme.spacing(1) }}
              >
                {" "}
                <Translate id="buttons.cancel" />
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
              onClick={() => history.push(Path.Goals)}
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
