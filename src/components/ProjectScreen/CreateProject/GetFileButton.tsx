import React from "react";
import { Typography, Button } from "@material-ui/core";
import { Translate } from "react-localize-redux";

export interface UploadProps {
  tagId?: string;
  disabled?: boolean;
  updateLanguage: (languageData: File) => void;
}

interface UploadState {
  fileName?: string;
}

// This button links to a set of functions
export default class GetFileButton extends React.Component<
  UploadProps,
  UploadState
> {
  private updateLanguageData(files: FileList) {
    const languageData = files[0];
    if (languageData) {
      this.props.updateLanguage(languageData);
      this.setState({ fileName: languageData.name });
    }
  }

  render() {
    return (
      <React.Fragment>
        {/* File upload */}
        {this.props.tagId && (
          <Typography
            variant="body1"
            style={{ marginRight: 20 }}
            display="inline"
          >
            <Translate id={this.props.tagId} />
          </Typography>
        )}
        {/* The actual file input element is hidden... */}
        <input
          id="file-input"
          type="file"
          name="name"
          accept=".zip"
          onChange={e => this.updateLanguageData(e.target.files as FileList)}
          style={{ display: "none" }}
        />
        {/* ... and this button is tied to it with the htmlFor property */}
        <label
          htmlFor="file-input"
          style={{
            cursor: "pointer"
          }}
        >
          <Button
            variant="contained"
            component="span"
            disabled={this.props.disabled}
          >
            <Translate id="createProject.browse" />
          </Button>
        </label>

        {/* Displays the name of the selected file */}
        {this.state && this.state.fileName && (
          <Typography variant="body1" noWrap style={{ marginTop: 30 }}>
            <Translate id="createProject.fileSelected" />: {this.state.fileName}
          </Typography>
        )}
      </React.Fragment>
    );
  }
}
