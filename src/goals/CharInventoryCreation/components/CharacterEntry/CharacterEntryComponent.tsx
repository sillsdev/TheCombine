import { Grid, Collapse, Button } from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";
import React, { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import CharactersInput from "goals/CharInventoryCreation/components/CharacterEntry/CharactersInput";
import theme from "types/theme";

interface CharEntryProps {
  setValidCharacters: (inventory: string[]) => void;
  validCharacters: string[];
  setRejectedCharacters: (inventory: string[]) => void;
  rejectedCharacters: string[];
}

/**
 * Allows for viewing and entering accepted and rejected characters in a
 * character set
 */
export default function CharacterEntry(props: CharEntryProps): ReactElement {
  const [checked, setChecked] = useState(false);
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <Grid item xs={12}>
        <Grid
          container
          style={{
            padding: theme.spacing(1),
            background: "whitesmoke",
            borderTop: "1px solid #ccc",
          }}
          spacing={2}
        >
          <Button
            onClick={() => setChecked(!checked)}
            id="character-entry-submit"
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
                characters={props.validCharacters}
                setCharacters={(chars) => props.setValidCharacters(chars)}
                label={t("charInventory.characterSet.acceptedCharacters")}
                id="valid-characters-input"
              />
            </Grid>

            {/* Input for rejected characters */}
            <Grid item xs={12}>
              <CharactersInput
                characters={props.rejectedCharacters}
                setCharacters={(chars) => props.setRejectedCharacters(chars)}
                label={t("charInventory.characterSet.rejectedCharacters")}
                id="rejected-characters-input"
              />
            </Grid>
          </Collapse>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
