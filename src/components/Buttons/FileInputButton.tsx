import { Button } from "@mui/material";
import { ButtonProps } from "@mui/material/Button";
import { ReactElement, ReactNode } from "react";

interface BrowseProps {
  updateFile: (file: File) => void;
  accept?: string;
  buttonProps?: ButtonProps;
  children?: ReactNode;
}

// This button links to a set of functions
export default function FileInputButton(props: BrowseProps): ReactElement {
  function updateFirstFile(files: FileList): void {
    const file = files[0];
    if (file) {
      props.updateFile(file);
    }
  }

  return (
    <>
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
    </>
  );
}
