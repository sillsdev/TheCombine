import { TextField } from "@material-ui/core";
import { ReactElement } from "react";

import theme from "types/theme";

interface CharactersInputProps {
  setCharacters: (characters: string[]) => void;
  characters: string[];
  label: ReactElement;
  id?: string;
}

export default function CharactersInput(
  props: CharactersInputProps
): ReactElement {
  return (
    <TextField
      value={props.characters.join("")}
      onChange={(e) =>
        props.setCharacters(e.target.value.replace(/\s/g, "").split(""))
      }
      label={props.label}
      fullWidth
      variant="outlined"
      style={{ maxWidth: 512, marginTop: theme.spacing(1) }}
      inputProps={{
        style: { letterSpacing: 5 },
        spellCheck: false,
      }}
      autoComplete="off"
      id={props.id}
      name="characters"
    />
  );
}
