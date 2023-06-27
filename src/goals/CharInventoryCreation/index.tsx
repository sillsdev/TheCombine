import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
} from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { LoadingButton } from "components/Buttons";
import {
  exit,
  loadCharInvData,
  resetInState,
  setSelectedCharacter,
  uploadInventory,
} from "goals/CharInventoryCreation/Redux/CharacterInventoryActions";
import CharacterDetail from "goals/CharInventoryCreation/components/CharacterDetail";
import CharacterEntry from "goals/CharInventoryCreation/components/CharacterEntry";
import CharacterList from "goals/CharInventoryCreation/components/CharacterList";
import CharacterSetHeader from "goals/CharInventoryCreation/components/CharacterSetHeader";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";
import theme from "types/theme";

const idPrefix = "character-inventory";
export const buttonIdCancel = `${idPrefix}-cancel-button`;
export const buttonIdSave = `${idPrefix}-save-button`;
export const dialogButtonIdNo = `${idPrefix}-cancel-dialog-no-button`;
export const dialogButtonIdYes = `${idPrefix}-cancel-dialog-yes-button`;
export const dialogIdCancel = `${idPrefix}-cancel-dialog`;
const dialogTextIdCancel = `${idPrefix}-cancel-dialog-text`;
const dialogTitleIdCancel = `${idPrefix}-cancel-dialog-title`;

/**
 * Allows users to define a character inventory for a project
 */
export default function CharacterInventory() {
  const dispatch = useAppDispatch();

  const selectedCharacter = useAppSelector(
    (state: StoreState) => state.characterInventoryState.selectedCharacter
  );

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [saveInProgress, setSaveInProgress] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    dispatch(loadCharInvData());

    // Call when component unmounts.
    () => dispatch(resetInState());
  }, [dispatch]);

  const save = async (): Promise<void> => {
    setSaveInProgress(true);
    await dispatch(uploadInventory());
  };

  return (
    <>
      <Grid container justifyContent="center" spacing={2}>
        <Grid item xl={10} lg={9} md={8} xs={12}>
          <Grid
            container
            spacing={2}
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
          >
            <CharacterSetHeader />
            <CharacterEntry />
            <CharacterList />
          </Grid>
        </Grid>

        <Grid item xl={2} lg={3} md={4} xs={12}>
          {!selectedCharacter ? (
            <Fragment />
          ) : (
            <CharacterDetail
              character={selectedCharacter}
              close={() => dispatch(setSelectedCharacter(""))}
            />
          )}
        </Grid>

        <Grid item xs={12} style={{ borderTop: "1px solid #ccc" }}>
          {/* submission buttons */}
          <Grid container justifyContent="center">
            <LoadingButton
              loading={saveInProgress}
              buttonProps={{
                id: buttonIdSave,
                color: "primary",
                onClick: () => save(),
                style: { margin: theme.spacing(1) },
              }}
            >
              {t("buttons.save")}
            </LoadingButton>
            <Button
              id={buttonIdCancel}
              variant="contained"
              onClick={() => setCancelDialogOpen(true)}
              style={{ margin: theme.spacing(1) }}
            >
              {" "}
              {t("buttons.cancel")}
            </Button>
          </Grid>
        </Grid>
      </Grid>

      {/* "Are you sure?" dialog for the cancel button */}
      <Dialog
        id={dialogIdCancel}
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id={dialogTitleIdCancel}>
          {t("charInventory.dialog.title")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id={dialogTextIdCancel}>
            {t("charInventory.dialog.content")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            id={dialogButtonIdYes}
            onClick={() => exit()}
            variant="contained"
            color="secondary"
            autoFocus
          >
            {t("charInventory.dialog.yes")}
          </Button>
          <Button
            id={dialogButtonIdNo}
            onClick={() => setCancelDialogOpen(false)}
            color="primary"
          >
            {t("charInventory.dialog.no")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
