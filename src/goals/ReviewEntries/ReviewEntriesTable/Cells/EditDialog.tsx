import { CloseFullscreen, OpenInFull } from "@mui/icons-material";
import {
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Icon,
  IconButton,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";
import { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import { Flag, Word } from "api/models";
import { CloseButton, FlagButton } from "components/Buttons";
import SenseCard from "components/WordCard/SenseCard";
import SummarySenseCard from "components/WordCard/SummarySenseCard";
import { StoreState } from "types";
import { useAppSelector } from "types/hooks";
import { TextFieldWithFont } from "utilities/fontComponents";

interface EditDialogProps {
  cancel: () => void;
  confirm: (newId: string) => Promise<void>;
  open: boolean;
  word: Word;
}

export default function EditDialog(props: EditDialogProps): ReactElement {
  const analysisWritingSystems = useAppSelector(
    (state: StoreState) =>
      state.currentProjectState.project.analysisWritingSystems
  );
  const vernLang = useAppSelector(
    (state: StoreState) =>
      state.currentProjectState.project.vernacularWritingSystem.bcp47
  );

  const [newWord, setNewWord] = useState(props.word);
  const [showSenses, setShowSenses] = useState(true);

  const { t } = useTranslation();

  return (
    <Dialog fullWidth onClose={props.cancel} open={props.open}>
      <DialogTitle>
        {t("reviewEntries.materialTable.body.edit")}
        {" : "}
        {props.word.vernacular}
        <Icon />
        <CloseButton close={props.cancel} />
      </DialogTitle>
      <DialogContent>
        <Grid container direction="column" justifyContent="flex-start">
          {/* Vernacular */}
          <Grid item>
            <Card>
              <CardHeader title={t("reviewEntries.columns.vernacular")} />
              <CardContent>
                <TextFieldWithFont
                  label={vernLang}
                  onChange={(e) =>
                    setNewWord((prev) => ({
                      ...prev,
                      vernacular: e.target.value,
                    }))
                  }
                  value={newWord.vernacular}
                  vernacular
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Senses */}
          <Grid item>
            <Card>
              <CardHeader
                action={
                  newWord.senses.length > 1 && (
                    <IconButton onClick={() => setShowSenses((prev) => !prev)}>
                      {showSenses ? (
                        <CloseFullscreen style={{ color: "gray" }} />
                      ) : (
                        <OpenInFull style={{ color: "gray" }} />
                      )}
                    </IconButton>
                  )
                }
                title={t("reviewEntries.columns.senses")}
              />
              <CardContent>
                {showSenses ? (
                  newWord.senses.map((s) => (
                    <SenseCard key={s.guid} sense={s} />
                  ))
                ) : (
                  <SummarySenseCard senses={newWord.senses} />
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Pronunciations */}
          <Grid item>
            <Card>
              <CardHeader title={t("reviewEntries.columns.pronunciations")} />
              <CardContent></CardContent>
            </Card>
          </Grid>

          {/* Note */}
          <Grid item>
            <Card>
              <CardHeader title={t("reviewEntries.columns.note")} />
              <CardContent>
                <Select
                  onChange={(e: SelectChangeEvent) =>
                    setNewWord((prev) => ({
                      ...prev,
                      note: { ...prev.note, language: e.target.value },
                    }))
                  }
                  value={newWord.note.language}
                >
                  {analysisWritingSystems.map((ws) => (
                    <MenuItem
                      key={`${ws.bcp47}-${ws.name}`}
                      value={ws.bcp47}
                    >{`${ws.bcp47} : ${ws.name}`}</MenuItem>
                  ))}
                </Select>
                <TextFieldWithFont
                  analysis
                  lang={newWord.note.language}
                  onChange={(e) =>
                    setNewWord((prev) => ({
                      ...prev,
                      note: { ...prev.note, text: e.target.value },
                    }))
                  }
                  value={newWord.note.text}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Flag */}
          <Grid item>
            <Card>
              <CardHeader title={t("reviewEntries.columns.flag")} />
              <CardContent>
                <FlagButton
                  flag={newWord.flag}
                  updateFlag={(flag: Flag) =>
                    setNewWord((prev) => ({ ...prev, flag }))
                  }
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
