//external modules
import * as React from "react";
import {
  Translate,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { Grid } from "@material-ui/core";

export interface CreateProjectProps {
  createProject?: (name: string, languageData: string) => void;
}

interface CreateProjectState {
  name: string;
  languageData: string;
}

class CreateProject extends React.Component<
  CreateProjectProps & LocalizeContextProps,
  CreateProjectState
> {
  constructor(props: CreateProjectProps & LocalizeContextProps) {
    super(props);
    this.state = { name: "", languageData: "" };
  }

  updateName(
    evt: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) {
    const name = evt.target.value;
    const languageData = this.state.languageData;
    this.setState({ name: name, languageData: languageData });
  }

  updateLanguageData(
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) {
    const languageData = e.target.value;
    const name = this.state.name;
    this.setState({ languageData: languageData, name: name });
  }

  createProject(e: React.FormEvent<EventTarget>) {
    e.preventDefault();

    var name = this.state.name.trim();
    var languageData = this.state.languageData.trim();
    if (name == "") {
      // notify the user they need a project name
      alert("Username and password cannot be blank");
    } else if (this.props.createProject) {
      this.props.createProject(name, languageData);
    }
  }

  render() {
    //visual definition
    return (
      <Grid container justify="center">
        <form onSubmit={e => this.createProject(e)}>
          <TextField
            label={<Translate id="createProject.name" />}
            value={this.state.name}
            onChange={e => this.updateName(e)}
          />
          <br />

          <input
            id="file-input"
            type="file"
            name="name"
            accept=".lift"
            onChange={e => this.updateLanguageData(e)}
            style={{ display: "none" }}
          />
          <Button>
            <label htmlFor="file-input">
              <Translate id="createProject.browse" />
            </label>
          </Button>
          <br />

          <Button type="submit">
            <Translate id="createProject.create" />
          </Button>
        </form>
      </Grid>
    );
  }
}

export default withLocalize(CreateProject);
