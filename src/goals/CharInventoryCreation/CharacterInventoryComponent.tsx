import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
} from "@material-ui/core";
import * as React from "react";
import { Translate } from "react-localize-redux";

import history, { Path } from "browserHistory";
import LoadingDoneButton from "components/Buttons/LoadingDoneButton";
import { CharacterSetEntry } from "goals/CharInventoryCreation/CharacterInventoryReducer";
import CharacterDetail from "goals/CharInventoryCreation/components/CharacterDetail";
import CharacterEntry from "goals/CharInventoryCreation/components/CharacterEntry";
import CharacterList from "goals/CharInventoryCreation/components/CharacterList";
import CharacterSetHeader from "goals/CharInventoryCreation/components/CharacterList/CharacterSetHeader";
import { Goal } from "types/goals";
import { Project } from "types/project";
import theme from "types/theme";

interface CharacterInventoryProps {
  goal: Goal;
  setValidCharacters: (inventory: string[]) => void;
  setRejectedCharacters: (inventory: string[]) => void;
  setSelectedCharacter: (character: string) => void;
  uploadInventory: (goal: Goal) => Promise<void>;
  fetchWords: () => void;
  currentProject: Project;
  selectedCharacter: string;
  getAllCharacters: () => Promise<void>;
  allCharacters: CharacterSetEntry[];
  resetInState: () => void;
}

export const SAVE: string = "pushGoals";
export const CANCEL: string = "cancelInventoryCreation";

interface CharacterInventoryState {
  cancelDialogOpen: boolean;
  saveInProgress: boolean;
  saveSuccessful: boolean;
}

/**
 * Allows users to define a character inventory for a project
 */
export default class CharacterInventory extends React.Component<
  CharacterInventoryProps,
  CharacterInventoryState
> {
  constructor(props: CharacterInventoryProps) {
    super(props);
    this.state = {
      cancelDialogOpen: false,
      saveInProgress: false,
      saveSuccessful: false,
    };
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

  async save() {
    this.setState({ saveInProgress: true });
    await this.props.uploadInventory(this.props.goal);
    this.setState({ saveInProgress: false, saveSuccessful: true });
    // Manually pause so user can see save success.
    setTimeout(() => this.quit(), 1000);
  }

  quit() {
    this.props.resetInState();
    history.push(Path.Goals);
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
              <LoadingDoneButton
                done={this.state.saveSuccessful}
                loading={this.state.saveInProgress}
                buttonProps={{
                  id: SAVE,
                  color: "primary",
                  onClick: () => this.save(),
                  style: { margin: theme.spacing(1) },
                }}
              >
                <Translate id="buttons.save" />
              </LoadingDoneButton>
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
              onClick={() => this.quit()}
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
