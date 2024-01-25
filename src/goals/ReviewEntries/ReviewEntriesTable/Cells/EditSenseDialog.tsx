import { Check, Close } from "@mui/icons-material";
import {
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { grey, yellow } from "@mui/material/colors";
import {
  type CSSProperties,
  type ReactElement,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import {
  type Pronunciation,
  type Sense,
  type Word,
  GramCatGroup,
  type Gloss,
  type WritingSystem,
  // type Definition,
} from "api/models";
import { deleteAudio, updateWord } from "backend";
import { PartOfSpeechButton } from "components/Buttons";
import { uploadFileFromPronunciation } from "components/Pronunciations/utilities";
import {
  areDefinitionsSame,
  areDomainsSame,
  areGlossesSame,
  cleanSense,
} from "goals/ReviewEntries/ReviewEntriesTable/Cells/utilities";
import { type StoreState } from "types";
import { useAppSelector } from "types/hooks";
import { themeColors } from "types/theme";
import { newGloss } from "types/word";
import { TextFieldWithFont } from "utilities/fontComponents";

/** Update word in the backend */
export async function updateFrontierWord(
  newSense: Word,
  newAudio: Pronunciation[],
  oldAudio: Pronunciation[]
): Promise<string> {
  let newId = newSense.id;
  for (const o of oldAudio) {
    if (!newSense.audio.find((n) => n.fileName === o.fileName)) {
      newId = await deleteAudio(newId, o.fileName);
    }
  }
  newId = (await updateWord({ ...newSense, id: newId })).id;
  for (const pro of newAudio) {
    newId = await uploadFileFromPronunciation(newId, pro);
  }
  return newId;
}

enum EditField {
  Definitions,
  Glosses,
  // GrammaticalInfo, // Not editable
  SemanticDomains,
}

type EditFieldChanged = Record<EditField, boolean>;
const defaultEditFieldChanged: EditFieldChanged = {
  [EditField.Definitions]: false,
  [EditField.Glosses]: false,
  [EditField.SemanticDomains]: false,
};

interface EditSenseDialogProps {
  close: () => void;
  isOpen: boolean;
  save: (sense: Sense) => void;
  sense: Sense;
}

export default function EditSenseDialog(
  props: EditSenseDialogProps
): ReactElement {
  const analysisWritingSystems = useAppSelector(
    (state: StoreState) =>
      state.currentProjectState.project.analysisWritingSystems
  );

  const [newSense, setNewSense] = useState(props.sense);
  const [changes, setChanges] = useState(defaultEditFieldChanged);

  useEffect(() => {
    setChanges({
      [EditField.Definitions]: areDefinitionsSame(
        newSense.definitions,
        props.sense.definitions
      ),
      [EditField.Glosses]: areGlossesSame(
        newSense.glosses,
        props.sense.glosses
      ),
      [EditField.SemanticDomains]: areDomainsSame(
        newSense.semanticDomains,
        props.sense.semanticDomains
      ),
    });
  }, [newSense, props.sense]);

  const bgStyle = (field?: EditField): CSSProperties => ({
    backgroundColor: field && changes[field] ? yellow[50] : grey[200],
  });

  // Functions for handling definitions in the state.
  /*const updateDefinitions = (definitions: Definition[]): void =>
  setNewSense((prev) => ({ ...prev, definitions }));*/

  // Functions for handling glosses in the state.
  const updateGlosses = (glosses: Gloss[]): void =>
    setNewSense((prev) => ({ ...prev, glosses }));
  // Functions for handling the semantic domains in the state.

  /** Clean up the edited word and update it backend and frontend. */
  const saveAndClose = (): void => {
    // If no changes, just close
    if (
      !changes[EditField.Definitions] &&
      !changes[EditField.Glosses] &&
      !changes[EditField.SemanticDomains]
    ) {
      cancelAndClose();
    }

    // Confirm nonempty senses
    const cleanedSense = cleanSense(newSense);
    if (!cleanedSense || typeof cleanedSense === "string") {
      toast.error(cleanedSense);
      return;
    }

    // Update in ReviewEntries state
    props.save(cleanedSense);

    // Close
    props.close();
  };

  /** Undo all edits and close the edit dialog. */
  const cancelAndClose = (): void => {
    setNewSense(props.sense);
    props.close();
  };

  const { t } = useTranslation();

  return (
    <Dialog fullWidth maxWidth={false} open={props.isOpen}>
      <DialogTitle>
        <Grid container justifyContent="space-between">
          <Grid item>{t("reviewEntries.materialTable.body.editSense")}</Grid>
          <Grid item>
            <IconButton onClick={saveAndClose}>
              <Check style={{ color: themeColors.success }} />
            </IconButton>
            <IconButton onClick={cancelAndClose}>
              <Close style={{ color: themeColors.error }} />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid
          container
          direction="column"
          justifyContent="flex-start"
          spacing={3}
        >
          {/* Definitions */}
          <Grid item>
            <Card sx={bgStyle(EditField.Definitions)}>
              <CardHeader title={t("reviewEntries.columns.definitions")} />
              <CardContent>
                <TextFieldWithFont
                  //label={vernLang}
                  onChange={(e) =>
                    setNewSense((prev) => ({
                      ...prev,
                      vernacular: e.target.value,
                    }))
                  }
                  value={newSense.definitions}
                  vernacular
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Glosses */}
          <Grid item>
            <Card sx={bgStyle(EditField.Glosses)}>
              <CardHeader title={t("reviewEntries.columns.glosses")} />
              <CardContent>
                <GlossList
                  defaultLang={analysisWritingSystems[0]}
                  glosses={newSense.glosses}
                  onChange={updateGlosses}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Part of Speech */}
          <Grid item>
            <Card sx={bgStyle()}>
              <CardHeader title={t("reviewEntries.columns.partOfSpeech")} />
              <CardContent>
                {newSense.grammaticalInfo.catGroup ===
                GramCatGroup.Unspecified ? (
                  <Typography>None</Typography>
                ) : (
                  <PartOfSpeechButton gramInfo={newSense.grammaticalInfo} />
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Semantic Domains */}
          <Grid item>
            <Card sx={bgStyle(EditField.SemanticDomains)}>
              <CardHeader title={t("reviewEntries.columns.domains")} />
              <CardContent>
                <TextFieldWithFont
                  //label={vernLang}
                  onChange={(e) =>
                    setNewSense((prev) => ({
                      ...prev,
                      vernacular: e.target.value,
                    }))
                  }
                  value={newSense.semanticDomains}
                  vernacular
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

interface GlossListProps {
  defaultLang: WritingSystem;
  glosses: Gloss[];
  onChange: (glosses: Gloss[]) => void;
}

function GlossList(props: GlossListProps): ReactElement {
  const glosses = props.glosses.find(
    (g) => g.language === props.defaultLang.bcp47
  )
    ? props.glosses
    : [...props.glosses, newGloss("", props.defaultLang.bcp47)];

  return (
    <>
      {glosses.map((g, i) => (
        <GlossField
          gloss={g}
          key={i}
          onChange={(gloss: Gloss) => {
            const updatedGlosses = [...glosses];
            updatedGlosses.splice(i, 1, gloss);
            props.onChange(updatedGlosses);
          }}
          textFieldId={`${i}-text`}
        />
      ))}
    </>
  );
}

interface GlossFieldProps {
  gloss: Gloss;
  textFieldId: string;
  onChange: (gloss: Gloss) => void;
}

function GlossField(props: GlossFieldProps): ReactElement {
  return (
    <TextFieldWithFont
      id={props.textFieldId}
      label={`${props.gloss.language}:`}
      lang={props.gloss.language}
      variant="outlined"
      margin="dense"
      multiline
      value={props.gloss.def}
      error={props.gloss.def.length === 0}
      onChange={(event) =>
        props.onChange(newGloss(event.target.value, props.gloss.language))
      }
    />
  );
}
