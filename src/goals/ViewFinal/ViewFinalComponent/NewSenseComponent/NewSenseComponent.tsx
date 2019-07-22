import React from "react";
import {
  Grid,
  TextField,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  Button,
  DialogActions
} from "@material-ui/core";
import {
  LocalizeContextProps,
  Translate,
  withLocalize
} from "react-localize-redux";
import { SemanticDomain } from "../../../../types/project";
import TreeView from "../../../../components/TreeView";
import { ViewFinalWord } from "../ViewFinalComponent";

export interface NewSenseProps {
  treeViewsDomain: SemanticDomain;

  addingSenseToWord: boolean;
  wordToEdit: ViewFinalWord;
  cancel: () => void;
  submit: (state: NewSenseState) => void;
}

export interface NewSenseState {
  glosses: string;
  domains: SemanticDomain[];
  addingDomains: boolean;
}

class NewSenseComponent extends React.Component<
  NewSenseProps & LocalizeContextProps,
  NewSenseState
> {
  constructor(props: NewSenseProps & LocalizeContextProps) {
    super(props);
    this.state = { glosses: "", domains: [], addingDomains: false };

    this.changeGlosses = this.changeGlosses.bind(this);
    this.deleteDomain = this.deleteDomain.bind(this);
    this.addDomain = this.addDomain.bind(this);
  }

  changeGlosses(event: React.ChangeEvent) {
    this.setState({ glosses: (event.target as any).value });
  }

  addDomain() {
    this.setState({
      domains: [...this.state.domains, this.props.treeViewsDomain],
      addingDomains: false
    });
  }

  deleteDomain(toDelete: SemanticDomain) {
    this.setState({
      domains: this.state.domains.filter(value => value !== toDelete)
    });
  }

  render() {
    return (
      <Dialog open={this.props.addingSenseToWord}>
        <DialogTitle>
          <Translate id="viewFinal.addSense" />
          {this.props.wordToEdit && this.props.wordToEdit.vernacular}
        </DialogTitle>
        <Paper>
          <Grid container direction="row" spacing={2}>
            <Grid item xs>
              <TextField
                label={<Translate id="viewFinal.newSense.gloss" />}
                value={this.state.glosses}
                onChange={this.changeGlosses}
              />
            </Grid>
            <Grid item xs>
              <Grid container direction="column" spacing={2}>
                {this.state.domains.length > 0 &&
                  this.state.domains.map(value => (
                    <Grid item xs>
                      <Chip
                        label={`${value.number}: ${value.name}`}
                        onDelete={this.deleteDomain}
                      />
                    </Grid>
                  ))}
                <Chip
                  onClick={() => this.setState({ addingDomains: true })}
                  label={<Translate id="viewFinal.newSense.domain" />}
                />
              </Grid>
            </Grid>
          </Grid>

          <Dialog fullScreen open={this.state.addingDomains}>
            <TreeView returnControlToCaller={this.addDomain} />
          </Dialog>
        </Paper>
        <DialogActions>
          <Button onClick={this.props.cancel} color="primary">
            <Translate id={"viewFinal.newSense.cancel"} />
          </Button>
          <Button onClick={() => this.props.submit(this.state)} color="primary">
            <Translate id={"viewFinal.newSense.submit"} />
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withLocalize(NewSenseComponent);
