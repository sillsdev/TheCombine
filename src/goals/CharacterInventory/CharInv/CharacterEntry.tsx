import { KeyboardArrowDown } from "@mui/icons-material";
import {
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid2,
} from "@mui/material";
import { ReactElement, ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

import LoadingButton from "components/Buttons/LoadingButton";
import {
  exit,
  setRejectedCharacters,
  setValidCharacters,
  uploadAndExit,
} from "goals/CharacterInventory/Redux/CharacterInventoryActions";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
import theme from "types/theme";
import { TextFieldWithFont } from "utilities/fontComponents";

export enum CharacterEntryTextId {
  ButtonCancel = "buttons.cancel",
  ButtonSave = "buttons.save",
  FieldAccepted = "charInventory.characterSet.acceptedCharacters",
  FieldRejected = "charInventory.characterSet.rejectedCharacters",
  ToggleAdvanced = "charInventory.characterSet.advanced",
}

/**
 * Allows for viewing and entering accepted and rejected characters in a
 * character set
 */
export default function CharacterEntry(): ReactElement {
  const dispatch = useAppDispatch();

  const { rejectedCharacters, validCharacters } = useAppSelector(
    (state: StoreState) => state.characterInventoryState
  );

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [saveInProgress, setSaveInProgress] = useState(false);

  const { t } = useTranslation();

  const save = async (): Promise<void> => {
    setSaveInProgress(true);
    await dispatch(uploadAndExit());
  };

  return (
    <div
      style={{
        background: "whitesmoke",
        border: "1px solid #ccc",
        padding: theme.spacing(1),
      }}
    >
      <Grid2 container alignContent="center" justifyContent="space-between">
        <Grid2 container spacing={2}>
          {/* Save button */}
          <LoadingButton
            buttonProps={{ onClick: () => save() }}
            loading={saveInProgress}
          >
            {t(CharacterEntryTextId.ButtonSave)}
          </LoadingButton>

          {/* Cancel button */}
          <Button
            color="secondary"
            onClick={() => setCancelDialogOpen(true)}
            variant="contained"
          >
            {t(CharacterEntryTextId.ButtonCancel)}
          </Button>

          {/* Cancel yes/no dialog */}
          <CancelDialog
            onClose={() => setCancelDialogOpen(false)}
            open={cancelDialogOpen}
          />
        </Grid2>

        {/* Advanced toggle-button */}
        <Button
          endIcon={
            <KeyboardArrowDown
              style={{
                transform: advancedOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "all 200ms",
              }}
            />
          }
          onClick={() => setAdvancedOpen((prev) => !prev)}
        >
          {t(CharacterEntryTextId.ToggleAdvanced)}
        </Button>
      </Grid2>

      <Collapse in={advancedOpen}>
        {/* Input for accepted characters */}
        <CharactersInput
          characters={validCharacters}
          label={t(CharacterEntryTextId.FieldAccepted)}
          setCharacters={(chars) => dispatch(setValidCharacters(chars))}
        />

        {/* Input for rejected characters */}
        <CharactersInput
          characters={rejectedCharacters}
          label={t(CharacterEntryTextId.FieldRejected)}
          setCharacters={(chars) => dispatch(setRejectedCharacters(chars))}
        />
      </Collapse>
    </div>
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
      label={props.label}
      name="characters"
      onChange={(e) =>
        props.setCharacters(e.target.value.replace(/\s/g, "").split(""))
      }
      slotProps={{
        htmlInput: { spellCheck: false, style: { letterSpacing: 5 } },
      }}
      style={{ marginTop: theme.spacing(2) }}
      value={props.characters.join("")}
      vernacular
    />
  );
}

export enum CancelDialogTextId {
  ButtonNo = "charInventory.dialog.no",
  ButtonYes = "charInventory.dialog.yes",
  Content = "charInventory.dialog.content",
  Title = "charInventory.dialog.title",
}

interface CancelDialogProps {
  open: boolean;
  onClose: () => void;
}

/** "Are you sure?" dialog for the cancel button */
function CancelDialog(props: CancelDialogProps): ReactElement {
  const { t } = useTranslation();

  return (
    <Dialog onClose={() => props.onClose()} open={props.open}>
      <DialogTitle>{t(CancelDialogTextId.Title)}</DialogTitle>

      <DialogContent>
        <DialogContentText>{t(CancelDialogTextId.Content)}</DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button
          autoFocus
          color="secondary"
          onClick={() => exit()}
          variant="contained"
        >
          {t(CancelDialogTextId.ButtonYes)}
        </Button>

        <Button onClick={() => props.onClose()}>
          {t(CancelDialogTextId.ButtonNo)}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
