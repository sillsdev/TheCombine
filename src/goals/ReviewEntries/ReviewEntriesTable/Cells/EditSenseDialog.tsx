import { Add, Check, Close } from "@mui/icons-material";
import {
  Card,
  CardContent,
  CardHeader,
  Chip,
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
  type Definition,
  type SemanticDomain,
} from "api/models";
import { deleteAudio, updateWord } from "backend";
import { PartOfSpeechButton } from "components/Buttons";
import { CancelConfirmDialog } from "components/Dialogs";
import { uploadFileFromPronunciation } from "components/Pronunciations/utilities";
import TreeView from "components/TreeView";
import {
  areDefinitionsSame,
  areDomainsSame,
  areGlossesSame,
  cleanSense,
} from "goals/ReviewEntries/ReviewEntriesTable/Cells/utilities";
import { type StoreState } from "types";
import { useAppSelector } from "types/hooks";
import { newSemanticDomainForMongoDB } from "types/semanticDomain";
import { themeColors } from "types/theme";
import { newDefinition, newGloss } from "types/word";
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
  GrammaticalInfo,
  SemanticDomains,
}

type EditFieldChanged = Record<EditField, boolean>;
const defaultEditFieldChanged: EditFieldChanged = {
  [EditField.Definitions]: false,
  [EditField.GrammaticalInfo]: false,
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
  const [cancelDialog, setCancelDialog] = useState(false);
  const [changes, setChanges] = useState(defaultEditFieldChanged);

  useEffect(() => {
    setChanges({
      [EditField.Definitions]: !areDefinitionsSame(
        newSense.definitions,
        props.sense.definitions
      ),
      [EditField.Glosses]: !areGlossesSame(
        newSense.glosses,
        props.sense.glosses
      ),
      [EditField.GrammaticalInfo]: false, // not editable
      [EditField.SemanticDomains]: !areDomainsSame(
        newSense.semanticDomains,
        props.sense.semanticDomains
      ),
    });
  }, [newSense, props.sense]);

  const bgStyle = (field: EditField): CSSProperties => ({
    backgroundColor: changes[field] ? yellow[50] : grey[200],
  });

  // Functions for updating the edit sense state.
  const updateDefinitions = (definitions: Definition[]): void =>
    setNewSense((prev) => ({ ...prev, definitions }));
  const updateGlosses = (glosses: Gloss[]): void =>
    setNewSense((prev) => ({ ...prev, glosses }));
  const updateDomains = (semanticDomains: SemanticDomain[]): void =>
    setNewSense((prev) => ({ ...prev, semanticDomains }));

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

  /** Close if no changes, or open dialog to ask to discard changes. */
  const conditionalCancel = (): void => {
    if (
      changes[EditField.Definitions] ||
      changes[EditField.Glosses] ||
      changes[EditField.SemanticDomains]
    ) {
      setCancelDialog(true);
    } else {
      cancelAndClose();
    }
  };

  /** Undo all edits and close dialogs. */
  const cancelAndClose = (): void => {
    setNewSense(props.sense);
    setCancelDialog(false);
    props.close();
  };

  const { t } = useTranslation();

  return (
    <>
      <CancelConfirmDialog
        handleCancel={() => setCancelDialog(false)}
        handleConfirm={cancelAndClose}
        open={cancelDialog}
        textId="reviewEntries.materialTable.body.discardChanges"
      />
      <Dialog fullWidth maxWidth="sm" open={props.isOpen}>
        <DialogTitle>
          <Grid container justifyContent="space-between">
            <Grid item>{t("reviewEntries.materialTable.body.editSense")}</Grid>
            <Grid item>
              <IconButton onClick={saveAndClose}>
                <Check style={{ color: themeColors.success }} />
              </IconButton>
              <IconButton onClick={conditionalCancel}>
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
                  <DefinitionList
                    defaultLang={analysisWritingSystems[0]}
                    definitions={newSense.definitions}
                    onChange={updateDefinitions}
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
              <Card sx={bgStyle(EditField.GrammaticalInfo)}>
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
                  <DomainList
                    domains={newSense.semanticDomains}
                    onChange={updateDomains}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface DefinitionListProps {
  defaultLang: WritingSystem;
  definitions: Definition[];
  onChange: (definitions: Definition[]) => void;
}

function DefinitionList(props: DefinitionListProps): ReactElement {
  const definitions = props.definitions.find(
    (d) => d.language === props.defaultLang.bcp47
  )
    ? props.definitions
    : [...props.definitions, newDefinition("", props.defaultLang.bcp47)];

  return (
    <>
      {definitions.map((d, i) => (
        <DefinitionTextField
          definition={d}
          key={i}
          onChange={(definition: Definition) => {
            const updated = [...definitions];
            updated.splice(i, 1, definition);
            props.onChange(updated);
          }}
          textFieldId={`definition-${i}`}
        />
      ))}
    </>
  );
}

interface DefinitionTextFieldProps {
  definition: Definition;
  textFieldId: string;
  onChange: (definition: Definition) => void;
}

function DefinitionTextField(props: DefinitionTextFieldProps): ReactElement {
  return (
    <TextFieldWithFont
      fullWidth
      id={props.textFieldId}
      label={props.definition.language}
      lang={props.definition.language}
      margin="dense"
      multiline
      onChange={(event) =>
        props.onChange(
          newDefinition(event.target.value, props.definition.language)
        )
      }
      value={props.definition.text}
      variant="outlined"
    />
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
        <GlossTextField
          gloss={g}
          key={i}
          onChange={(gloss: Gloss) => {
            const updated = [...glosses];
            updated.splice(i, 1, gloss);
            props.onChange(updated);
          }}
          textFieldId={`gloss-${i}`}
        />
      ))}
    </>
  );
}

interface GlossTextFieldProps {
  gloss: Gloss;
  textFieldId: string;
  onChange: (gloss: Gloss) => void;
}

function GlossTextField(props: GlossTextFieldProps): ReactElement {
  return (
    <TextFieldWithFont
      fullWidth
      id={props.textFieldId}
      error={!props.gloss.def.trim()}
      label={props.gloss.language}
      lang={props.gloss.language}
      margin="dense"
      multiline
      onChange={(event) =>
        props.onChange(newGloss(event.target.value, props.gloss.language))
      }
      value={props.gloss.def}
      variant="outlined"
    />
  );
}

interface DomainListProps {
  domains: SemanticDomain[];
  onChange: (domains: SemanticDomain[]) => void;
}

function DomainList(props: DomainListProps): ReactElement {
  const selectedDom = useAppSelector(
    (state: StoreState) => state.treeViewState.currentDomain
  );
  const [addingDom, setAddingDom] = useState<boolean>(false);
  const { t } = useTranslation();

  function addDomain(): void {
    setAddingDom(false);
    if (!selectedDom) {
      throw new Error("Cannot add domain without the selectedDomain property.");
    }
    if (selectedDom.mongoId == "") {
      throw new Error("SelectedSemanticDomainTreeNode have no mongoId.");
    }
    if (props.domains.some((d) => d.id === selectedDom.id)) {
      toast.error(t("reviewEntries.duplicateDomain", { val: selectedDom.id }));
      return;
    }
    props.onChange([
      ...props.domains,
      newSemanticDomainForMongoDB(selectedDom),
    ]);
  }

  function deleteDomain(domId: string): void {
    props.onChange(props.domains.filter((d) => d.id !== domId));
  }

  return (
    <>
      <Grid container direction="row" spacing={2}>
        {props.domains.length > 0 ? (
          props.domains.map((domain, index) => (
            <Grid item key={`${domain.id}_${domain.name}`}>
              <Chip
                id={`domain-${index}`}
                label={`${domain.id}: ${domain.name}`}
                onDelete={() => deleteDomain(domain.id)}
              />
            </Grid>
          ))
        ) : (
          <Grid item xs>
            <Chip color="secondary" label={t("reviewEntries.noDomain")} />
          </Grid>
        )}
        <IconButton
          id="domain-add"
          onClick={() => setAddingDom(true)}
          size="large"
        >
          <Add />
        </IconButton>
      </Grid>
      <Dialog fullScreen open={addingDom}>
        <TreeView
          exit={() => setAddingDom(false)}
          returnControlToCaller={addDomain}
        />
      </Dialog>
    </>
  );
}
