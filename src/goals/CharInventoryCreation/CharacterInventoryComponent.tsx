import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
} from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";

import { Project } from "api/models";
import LoadingButton from "components/Buttons/LoadingButton";
import { CharacterSetEntry } from "goals/CharInventoryCreation/Redux/CharacterInventoryReduxTypes";
import CharacterDetail from "goals/CharInventoryCreation/components/CharacterDetail";
import CharacterEntry from "goals/CharInventoryCreation/components/CharacterEntry";
import CharacterList from "goals/CharInventoryCreation/components/CharacterList";
import CharacterSetHeader from "goals/CharInventoryCreation/components/CharacterList/CharacterSetHeader";
import { Goal } from "types/goals";
import theme from "types/theme";

interface CharacterInventoryProps {
  goal: Goal;
  setValidCharacters: (inventory: string[]) => void;
  setRejectedCharacters: (inventory: string[]) => void;
  setSelectedCharacter: (character: string) => void;
  uploadInventory: (goal: Goal) => Promise<void>;
  fetchWords: () => Promise<void>;
  currentProject: Project;
  selectedCharacter: string;
  getAllCharacters: () => Promise<void>;
  allCharacters: CharacterSetEntry[];
  resetInState: () => void;
  exit: () => void;
}

export const SAVE: string = "pushGoals";
export const CANCEL: string = "cancelInventoryCreation";

interface CharacterInventoryState {
  cancelDialogOpen: boolean;
  saveInProgress: boolean;
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
    };
  }

  async componentDidMount() {
    await this.props.fetchWords();
    this.props.setValidCharacters(this.props.currentProject.validCharacters);
    this.props.setRejectedCharacters(
      this.props.currentProject.rejectedCharacters
    );
    await this.props.getAllCharacters();
    this.props.setSelectedCharacter("");
  }

  handleClose() {
    this.setState({ cancelDialogOpen: false });
  }

  async save() {
    this.setState({ saveInProgress: true });
    await this.props.uploadInventory(this.props.goal);
  }

  componentWillUnmount() {
    this.props.resetInState();
  }

  render() {
    return (
      <div>
        <Grid container justifyContent="center" spacing={2}>
          <Grid item xl={10} lg={9} md={8} xs={12}>
            <Grid
              container
              spacing={2}
              direction="row"
              justifyContent="flex-start"
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
            <Grid container justifyContent="center">
              <LoadingButton
                loading={this.state.saveInProgress}
                buttonProps={{
                  id: SAVE,
                  color: "primary",
                  onClick: () => this.save(),
                  style: { margin: theme.spacing(1) },
                }}
              >
                <Translate id="buttons.save" />
              </LoadingButton>
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
              onClick={() => this.props.exit()}
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
