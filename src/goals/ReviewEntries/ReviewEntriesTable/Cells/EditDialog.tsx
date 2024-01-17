import { Dialog, DialogContent, DialogTitle, Icon } from "@mui/material";
import { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import { Word } from "api/models";
import { CloseButton } from "components/Buttons";
import WordCard from "components/WordCard";

interface EditDialogProps {
  cancel: () => void;
  confirm: (newId: string) => Promise<void>;
  open: boolean;
  word: Word;
}

export default function EditDialog(props: EditDialogProps): ReactElement {
  const [newWord, setNewWord] = useState(props.word);

  const { t } = useTranslation();

  return (
    <Dialog onClose={props.cancel} open={props.open}>
      <DialogTitle>
        {t("reviewEntries.materialTable.body.edit")}
        {" : "}
        {props.word.vernacular}
        <Icon />
        <CloseButton close={props.cancel} />
      </DialogTitle>
      <DialogContent>
        <WordCard word={newWord} />
      </DialogContent>
    </Dialog>
  );
}
