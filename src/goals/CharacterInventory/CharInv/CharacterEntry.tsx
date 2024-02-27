import { KeyboardArrowDown } from "@mui/icons-material";
import { Button, Collapse, Grid } from "@mui/material";
import { ReactElement, ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  setRejectedCharacters,
  setValidCharacters,
} from "goals/CharacterInventory/Redux/CharacterInventoryActions";
import { StoreState } from "Redux/rootReduxTypes";
import { useAppDispatch, useAppSelector } from "types/hooks";
import theme from "types/theme";
import { TextFieldWithFont } from "utilities/fontComponents";

/**
 * Allows for viewing and entering accepted and rejected characters in a
 * character set
 */
export default function CharacterEntry(): ReactElement {
  const dispatch = useAppDispatch();

  const { rejectedCharacters, validCharacters } = useAppSelector(
    (state: StoreState) => state.characterInventoryState
  );

  const [checked, setChecked] = useState(false);

  const { t } = useTranslation();

  return (
    <Grid item xs={12}>
      <Grid
        container
        style={{
          background: "whitesmoke",
          borderTop: "1px solid #ccc",
          padding: theme.spacing(1),
        }}
        spacing={2}
      >
        <Button
          id="character-entry-submit"
          onClick={() => setChecked(!checked)}
        >
          {t("charInventory.characterSet.advanced")}{" "}
          <KeyboardArrowDown
            style={{
              transform: checked ? "rotate(180deg)" : "rotate(0deg)",
              transition: "all 200ms",
            }}
          />
        </Button>
        <Collapse in={checked} style={{ width: "100%" }}>
          {/* Input for accepted characters */}
          <Grid item xs={12}>
            <CharactersInput
              characters={validCharacters}
              id="valid-characters-input"
              label={t("charInventory.characterSet.acceptedCharacters")}
              setCharacters={(chars) => dispatch(setValidCharacters(chars))}
            />
          </Grid>

          {/* Input for rejected characters */}
          <Grid item xs={12}>
            <CharactersInput
              characters={rejectedCharacters}
              id="rejected-characters-input"
              label={t("charInventory.characterSet.rejectedCharacters")}
              setCharacters={(chars) => dispatch(setRejectedCharacters(chars))}
            />
          </Grid>
        </Collapse>
      </Grid>
    </Grid>
  );
}

interface CharactersInputProps {
  characters: string[];
  id?: string;
  label: ReactNode;
  setCharacters: (characters: string[]) => void;
}

function CharactersInput(props: CharactersInputProps): ReactElement {
  return (
    <TextFieldWithFont
      autoComplete="off"
      fullWidth
      id={props.id}
      inputProps={{ spellCheck: false, style: { letterSpacing: 5 } }}
      label={props.label}
      name="characters"
      onChange={(e) =>
        props.setCharacters(e.target.value.replace(/\s/g, "").split(""))
      }
      style={{ maxWidth: 512, marginTop: theme.spacing(1) }}
      value={props.characters.join("")}
      variant="outlined"
      vernacular
    />
  );
}
