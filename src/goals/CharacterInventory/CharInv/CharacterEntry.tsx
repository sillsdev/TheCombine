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

import { LoadingButton } from "components/Buttons";
import {
  exit,
  setRejectedCharacters,
  setValidCharacters,
  uploadInventory,
} from "goals/CharacterInventory/Redux/CharacterInventoryActions";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
import theme from "types/theme";
import { TextFieldWithFont } from "utilities/fontComponents";

export enum CharInvCancelSaveIds {
  ButtonCancel = "char-inv-cancel-button",
  ButtonSave = "char-inv-save-button",
  DialogCancel = "char-inv-cancel-dialog",
  DialogCancelButtonNo = "char-inv-cancel-dialog-no-button",
  DialogCancelButtonYes = "char-inv-cancel-dialog-yes-button",
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
    await dispatch(uploadInventory());
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
            buttonProps={{
              "data-testid": CharInvCancelSaveIds.ButtonSave,
              id: CharInvCancelSaveIds.ButtonSave,
              onClick: () => save(),
            }}
            loading={saveInProgress}
          >
            {t("buttons.save")}
          </LoadingButton>

          {/* Cancel button */}
          <Button
            color="secondary"
            data-testid={CharInvCancelSaveIds.ButtonCancel}
            id={CharInvCancelSaveIds.ButtonCancel}
            onClick={() => setCancelDialogOpen(true)}
            variant="contained"
          >
            {t("buttons.cancel")}
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
          {t("charInventory.characterSet.advanced")}
        </Button>
      </Grid2>

      <Collapse in={advancedOpen}>
        {/* Input for accepted characters */}
        <CharactersInput
          characters={validCharacters}
          id="valid-characters-input"
          label={t("charInventory.characterSet.acceptedCharacters")}
          setCharacters={(chars) => dispatch(setValidCharacters(chars))}
        />

        {/* Input for rejected characters */}
        <CharactersInput
          characters={rejectedCharacters}
          id="rejected-characters-input"
          label={t("charInventory.characterSet.rejectedCharacters")}
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
      inputProps={{
        "data-testid": props.id,
        spellCheck: false,
        style: { letterSpacing: 5 },
      }}
      label={props.label}
      name="characters"
      onChange={(e) =>
        props.setCharacters(e.target.value.replace(/\s/g, "").split(""))
      }
      style={{ marginTop: theme.spacing(2) }}
      value={props.characters.join("")}
      variant="outlined"
      vernacular
    />
  );
}

interface CancelDialogProps {
  open: boolean;
  onClose: () => void;
}

/** "Are you sure?" dialog for the cancel button */
function CancelDialog(props: CancelDialogProps): ReactElement {
  const { t } = useTranslation();

  return (
    <Dialog
      data-testid={CharInvCancelSaveIds.DialogCancel}
      id={CharInvCancelSaveIds.DialogCancel}
      onClose={() => props.onClose()}
      open={props.open}
    >
      <DialogTitle>{t("charInventory.dialog.title")}</DialogTitle>

      <DialogContent>
        <DialogContentText>
          {t("charInventory.dialog.content")}
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button
          autoFocus
          color="secondary"
          data-testid={CharInvCancelSaveIds.DialogCancelButtonYes}
          id={CharInvCancelSaveIds.DialogCancelButtonYes}
          onClick={() => exit()}
          variant="contained"
        >
          {t("charInventory.dialog.yes")}
        </Button>

        <Button
          data-testid={CharInvCancelSaveIds.DialogCancelButtonNo}
          id={CharInvCancelSaveIds.DialogCancelButtonNo}
          onClick={() => props.onClose()}
        >
          {t("charInventory.dialog.no")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
