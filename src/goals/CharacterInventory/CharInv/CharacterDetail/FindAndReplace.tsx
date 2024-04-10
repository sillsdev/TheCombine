import { Button, Typography } from "@mui/material";
import { type ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import CancelConfirmDialog from "components/Dialogs/CancelConfirmDialog";
import { findAndReplace } from "goals/CharacterInventory/Redux/CharacterInventoryActions";
import { useAppDispatch } from "rootRedux/hooks";
import { TextFieldWithFont } from "utilities/fontComponents";

const idPrefix = "find-and-replace";
const fieldIdFind = `${idPrefix}-find-field`;
const fieldIdReplace = `${idPrefix}-replace-field`;
export const buttonIdSubmit = `${idPrefix}-submit-button`;
export const buttonIdCancel = `${idPrefix}-cancel-button`;
export const buttonIdConfirm = `${idPrefix}-confirm-button`;

interface FindAndReplaceProps {
  initialFindValue: string;
}

/** Component for replacing one character (every occurrence of it in the vernacular form
 * of a word in the project) with another character. */
export default function FindAndReplace(
  props: FindAndReplaceProps
): ReactElement {
  const [findValue, setFindValue] = useState(props.initialFindValue);
  const [replaceValue, setReplaceValue] = useState("");
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    setFindValue(props.initialFindValue);
    setReplaceValue("");
  }, [props.initialFindValue]);

  const dispatchFindAndReplace = async (): Promise<void> => {
    await dispatch(findAndReplace(findValue, replaceValue)).catch(() =>
      toast.error(
        t("charInventory.characterSet.findAndReplaceError", {
          val1: findValue,
          val2: replaceValue,
        })
      )
    );
    setWarningDialogOpen(false);
  };

  const dialogText = (
    <>
      {t("charInventory.characterSet.replaceAll", { val: findValue })}
      <br />
      {t("charInventory.characterSet.replaceAllWith", { val: replaceValue })}
    </>
  );

  return (
    <>
      <Typography variant="overline">
        {t("charInventory.characterSet.findAndReplace")}
      </Typography>
      <TextFieldWithFont
        id={fieldIdFind}
        label={t("charInventory.characterSet.find")}
        value={findValue}
        onChange={(e) => setFindValue(e.target.value)}
        variant="outlined"
        style={{ width: "100%" }}
        margin="normal"
        inputProps={{ maxLength: 100 }}
        vernacular
      />
      <TextFieldWithFont
        id={fieldIdReplace}
        label={t("charInventory.characterSet.replaceWith")}
        value={replaceValue}
        onChange={(e) => setReplaceValue(e.target.value)}
        variant="outlined"
        style={{ width: "100%" }}
        margin="normal"
        inputProps={{ maxLength: 100 }}
        vernacular
      />
      <Button
        color="primary"
        id={buttonIdSubmit}
        onClick={() => setWarningDialogOpen(true)}
      >
        {t("charInventory.characterSet.apply")}
      </Button>
      <CancelConfirmDialog
        open={warningDialogOpen}
        text={dialogText}
        handleCancel={() => setWarningDialogOpen(false)}
        handleConfirm={dispatchFindAndReplace}
        buttonIdCancel={buttonIdCancel}
        buttonIdConfirm={buttonIdConfirm}
      />
    </>
  );
}
