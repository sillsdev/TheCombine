import React from "react";
import { Button } from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button";

export interface BrowseProps {
  updateFile: (file: File) => void;
  accept?: string;
}

// This button links to a set of functions
export default function FileInputButton(props: BrowseProps & ButtonProps) {
  function updateFile(files: FileList) {
    const file = files[0];
    if (file) {
      props.updateFile(file);
    }
  }

  return (
    <React.Fragment>
      {/* The actual file input element is hidden... */}
      <input
        id="file-input"
        type="file"
        name="name"
        accept={props.accept}
        onChange={(e) => updateFile(e.target.files as FileList)}
        style={{ display: "none" }}
      />

      {/* ... and this button is tied to it with the htmlFor property */}
      <label htmlFor="file-input">
        <Button variant="contained" component="span" {...props}>
          {props.children}
        </Button>
      </label>
    </React.Fragment>
  );
}
