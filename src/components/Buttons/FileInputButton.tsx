import { Button } from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button";
import React from "react";

interface BrowseProps {
  updateFile: (file: File) => void;
  accept?: string;
  children?: React.ReactNode;
  buttonProps?: ButtonProps;
}

// This button links to a set of functions
export default function FileInputButton(props: BrowseProps) {
  function updateFirstFile(files: FileList) {
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
        onChange={(e) => updateFirstFile(e.target.files as FileList)}
        // Clear value on-click to allow same file to be selected twice in a row
        onClick={(e) => (e.currentTarget.value = "")}
        style={{ display: "none" }}
      />

      {/* ... and this button is tied to it with the htmlFor property */}
      <label htmlFor="file-input">
        <Button variant="contained" component="span" {...props.buttonProps}>
          {props.children}
        </Button>
      </label>
    </React.Fragment>
  );
}
