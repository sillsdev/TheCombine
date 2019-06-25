import * as React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate,
  TranslateFunction
} from "react-localize-redux";
import CharacterSet from "./components/CharacterSet";
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

export interface CharacterInventoryProps {
  setInventory: (inventory: string[]) => void;
  uploadInventory: () => void;
  inventory: string[];
  currentProject: Project;
  translate: TranslateFunction;
}

interface CharacterInventoryState {
  cancelDialogOpen: boolean;
}

class CharacterInventory extends React.Component<
  CharacterInventoryProps & LocalizeContextProps,
  CharacterInventoryState
> {
  constructor(props: CharacterInventoryProps & LocalizeContextProps) {
    super(props);
    // Load inventory from server
    this.props.setInventory(this.props.currentProject.characterSet);
    this.state = { cancelDialogOpen: false };
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
          style={{ background: "#eee" }}
        >
          <Grid item sm={6} xs={12}>
            <CharacterSet
              setInventory={inventory => this.props.setInventory(inventory)}
              inventory={this.props.inventory}
            />
          </Grid>
          <Grid item sm={6} xs={12}>
            <SampleWords
              setInventory={inventory => this.props.setInventory(inventory)}
              inventory={this.props.inventory}
            />
          </Grid>
          <Grid item xs={12}>
            {/* submission buttons */}
            <Grid container justify="center">
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  this.props.uploadInventory();
                }}
                style={{ margin: 10 }} // remove when we can add theme
              >
                <Translate id="charInventory.save" />
              </Button>
              <Button
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
        <Dialog
          open={this.state.cancelDialogOpen}
          onClose={() => this.handleClose()}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Discard changes?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Do you want to discard your modifications to the character set?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => this.handleClose()}
              variant="contained"
              color="secondary"
              autoFocus
            >
              Yes, Discard Changes
            </Button>
            <Button onClick={() => this.handleClose()} color="primary">
              No
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default withLocalize(CharacterInventory);
