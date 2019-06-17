import * as React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate
} from "react-localize-redux";
import CharacterSet from "./components/CharacterSet";
import { Grid, Button } from "@material-ui/core";

export interface CharacterInventoryProps {
  setInventory: (inventory: string[]) => void;
  uploadInventory: () => void;
  inventory: string[];
}

interface CharacterInventoryState {}

class CharacterInventory extends React.Component<
  CharacterInventoryProps & LocalizeContextProps,
  CharacterInventoryState
> {
  constructor(props: CharacterInventoryProps & LocalizeContextProps) {
    super(props);
    // Load inventory from server
    this.props.setInventory(["a", "b", "c"]);
  }

  render() {
    return (
      <Grid container justify="center" alignItems="center">
        <Grid item xs={6}>
          <CharacterSet
            setInventory={inventory => this.props.setInventory(inventory)}
            inventory={this.props.inventory}
          />
        </Grid>
        <Grid item xs={6}>
          {/* William, put the other component here */}
        </Grid>
        <Grid item xs={12}>
          {/* submission buttons */}
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
              alert("are you sure?"); //obviously this needs to be a dialog
            }}
            style={{ margin: 10 }} // remove when we can add theme
          >
            {" "}
            <Translate id="charInventory.cancel" />
          </Button>
        </Grid>
      </Grid>
    );
  }
}

export default withLocalize(CharacterInventory);
