import { Button, Typography } from "@mui/material";
import { type ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import CancelConfirmDialog from "components/Dialogs/CancelConfirmDialog";
import { findAndReplace } from "goals/CharacterInventory/Redux/CharacterInventoryActions";
import { useAppDispatch } from "rootRedux/hooks";
import { TextFieldWithFont } from "utilities/fontComponents";

export enum FindAndReplaceId {
  ButtonCancel = `find-and-replace-cancel-button`,
  ButtonConfirm = `find-and-replace-confirm-button`,
  ButtonSubmit = `find-and-replace-submit-button`,
  FieldFind = `find-and-replace-find-field`,
  FieldReplace = `find-and-replace-replace-field`,
}

interface FindAndReplaceProps {
  close: () => void;
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
    props.close();
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
        id={FindAndReplaceId.FieldFind}
        label={t("charInventory.characterSet.find")}
        value={findValue}
        onChange={(e) => setFindValue(e.target.value)}
        variant="outlined"
        style={{ width: "100%" }}
        margin="normal"
        inputProps={{
          "data-testid": FindAndReplaceId.FieldFind,
          maxLength: 100,
        }}
        vernacular
      />
      <TextFieldWithFont
        id={FindAndReplaceId.FieldReplace}
        label={t("charInventory.characterSet.replaceWith")}
        value={replaceValue}
        onChange={(e) => setReplaceValue(e.target.value)}
        variant="outlined"
        style={{ width: "100%" }}
        margin="normal"
        inputProps={{
          "data-testid": FindAndReplaceId.FieldReplace,
          maxLength: 100,
        }}
        vernacular
      />
      <Button
        color="primary"
        data-testid={FindAndReplaceId.ButtonSubmit}
        id={FindAndReplaceId.ButtonSubmit}
        onClick={() => setWarningDialogOpen(true)}
      >
        {t("charInventory.characterSet.apply")}
      </Button>
      <CancelConfirmDialog
        open={warningDialogOpen}
        text={dialogText}
        handleCancel={() => setWarningDialogOpen(false)}
        handleConfirm={dispatchFindAndReplace}
        buttonIdCancel={FindAndReplaceId.ButtonCancel}
        buttonIdConfirm={FindAndReplaceId.ButtonConfirm}
      />
    </>
  );
}
