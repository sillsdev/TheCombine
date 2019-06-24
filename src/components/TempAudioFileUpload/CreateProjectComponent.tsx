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
  createProject?: (name: string, languageData: File) => void;
  asyncCreateProject?: (name: string, languageData: File) => void;
}

interface CreateProjectState {
  name: string;
  languageData?: File;
  fileName?: string;
}

class UploadMp3 extends React.Component<
  CreateProjectProps & LocalizeContextProps,
  CreateProjectState
> {
  constructor(props: CreateProjectProps & LocalizeContextProps) {
    super(props);
    this.state = { name: "" };
  }

  updateName(
    evt: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) {
    const name = evt.target.value;
    const languageData = this.state.languageData;
    this.setState({ languageData, name });
  }

  updateLanguageData(files: FileList) {
    const languageData = files[0];
    const fileName = languageData.name;
    const name = this.state.name;
    this.setState({ languageData, name, fileName });
  }

  createProject(e: React.FormEvent<EventTarget>) {
    e.preventDefault();

    const name = this.state.name.trim();
    const languageData = this.state.languageData;
    if (this.props.asyncCreateProject)
      this.props.asyncCreateProject("james", languageData as File);
  }

  render() {
    //visual definition
    return (
      <Grid container justify="center">
        <form onSubmit={e => this.createProject(e)}>
          <br />

          <input
            id="file-input"
            type="file"
            name="name"
            accept=".mp3"
            onChange={e => this.updateLanguageData(e.target.files as FileList)}
            style={{ display: "none" }}
          />
          <Button>
            <label htmlFor="file-input">Browse</label>
          </Button>
          <br />
          <p>File Selected: {this.state.fileName}</p>
          <br />
          <Button type="submit">Upload audio</Button>
        </form>
      </Grid>
    );
  }
}

export default withLocalize(UploadMp3);
