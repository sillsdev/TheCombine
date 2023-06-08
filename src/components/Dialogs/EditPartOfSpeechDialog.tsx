import { Clear } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import React, { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { Key } from "ts-key-enum";

import { GramCatGroup, GrammaticalInfo } from "api";

interface EditPartOfSpeechDialogProps {
  open: boolean;
  gramInfo: GrammaticalInfo;
  titleId: string;
  close: () => void;
  update: (newGramInfo: GrammaticalInfo) => void | Promise<void>;
  buttonIdCancel?: string;
  buttonIdConfirm?: string;
  buttonTextIdCancel?: string;
  buttonTextIdConfirm?: string;
  textFieldId?: string;
  selectId?: string;
}

/**
 * Dialog to edit part of speech and either confirm or cancel the edit
 */
export default function EditPartOfSpeechDialog(
  props: EditPartOfSpeechDialogProps
): ReactElement {
  const [catGroup, setCatGroup] = useState(props.gramInfo.catGroup);
  const [gramCat, setGramCat] = useState(props.gramInfo.grammaticalCategory);
  const { t } = useTranslation();

  async function onConfirm() {
    props.close();
    if (
      catGroup !== props.gramInfo.catGroup ||
      gramCat !== props.gramInfo.grammaticalCategory
    ) {
      await props.update({ catGroup, grammaticalCategory: gramCat });
    }
  }

  function onCancel() {
    setCatGroup(props.gramInfo.catGroup);
    setGramCat(props.gramInfo.grammaticalCategory);
    props.close();
  }

  function onClear() {
    setCatGroup(GramCatGroup.Unspecified);
    setGramCat("");
  }

  function escapeClose(_: any, reason: "backdropClick" | "escapeKeyDown") {
    if (reason === "escapeKeyDown") {
      onCancel();
    }
  }

  function confirmIfEnter(event: React.KeyboardEvent) {
    if (event.key === Key.Enter) {
      onConfirm();
    }
  }

  const endAdornment = (
    <InputAdornment position="end">
      <IconButton onClick={onClear} size="large">
        <Clear />
      </IconButton>
    </InputAdornment>
  );

  const catGroups = [
    GramCatGroup.Unspecified,
    ...Object.values(GramCatGroup).filter(
      (gcg) => gcg !== GramCatGroup.Other && gcg !== GramCatGroup.Unspecified
    ),
    GramCatGroup.Other,
  ];
  console.info(catGroups);

  return (
    <Dialog
      open={props.open}
      onClose={escapeClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{t(props.titleId)}</DialogTitle>
      <DialogContent>
        <Select
          id={props.selectId}
          value={catGroup}
          onChange={(e: SelectChangeEvent<GramCatGroup>) =>
            setCatGroup(e.target.value as GramCatGroup)
          }
        >
          {catGroups.map((cg) => {
            <MenuItem key={cg} value={cg}>
              {cg}
            </MenuItem>;
          })}
        </Select>
        <TextField
          variant="standard"
          autoFocus
          value={gramCat}
          onChange={(e) => setGramCat(e.target.value)}
          onKeyPress={confirmIfEnter}
          InputProps={{ endAdornment }}
          id={props.textFieldId}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onCancel}
          variant="outlined"
          color="primary"
          id={props.buttonIdCancel}
        >
          {t(props.buttonTextIdCancel ?? "buttons.cancel")}
        </Button>
        <Button
          onClick={onConfirm}
          variant="outlined"
          color="primary"
          id={props.buttonIdConfirm}
        >
          {t(props.buttonTextIdConfirm ?? "buttons.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
