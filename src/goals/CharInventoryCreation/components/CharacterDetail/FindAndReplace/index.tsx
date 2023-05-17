import { Button, TextField, Typography } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import CharacterReplaceDialog from "goals/CharInventoryCreation/components/CharacterDetail/FindAndReplace/CharacterReplaceDialog";
import { findAndReplace } from "goals/CharInventoryCreation/components/CharacterDetail/FindAndReplace/FindAndReplaceActions";
import { useAppDispatch } from "types/hooks";

interface FindAndReplaceProps {
  initialFindValue: string;
}

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
  }, [props.initialFindValue, setFindValue, setReplaceValue]);

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

  return (
    <>
      <Typography variant="overline">
        {t("charInventory.characterSet.findAndReplace")}
      </Typography>
      <TextField
        label={t("charInventory.characterSet.find")}
        value={findValue}
        onChange={(e) => setFindValue(e.target.value)}
        variant="outlined"
        style={{ width: "100%" }}
        margin="normal"
        inputProps={{ maxLength: 100 }}
      />
      <TextField
        label={t("charInventory.characterSet.replaceWith")}
        value={replaceValue}
        onChange={(e) => setReplaceValue(e.target.value)}
        variant="outlined"
        style={{ width: "100%" }}
        margin="normal"
        inputProps={{ maxLength: 100 }}
      />
      <Button color="primary" onClick={() => setWarningDialogOpen(true)}>
        {t("charInventory.characterSet.apply")}
      </Button>
      <CharacterReplaceDialog
        open={warningDialogOpen}
        dialogFindValue={findValue}
        dialogReplaceValue={replaceValue}
        handleCancel={() => setWarningDialogOpen(false)}
        handleAccept={dispatchFindAndReplace}
      />
    </>
  );
}
