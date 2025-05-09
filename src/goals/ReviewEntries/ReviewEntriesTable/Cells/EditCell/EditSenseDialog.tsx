import { Add, Check, Close } from "@mui/icons-material";
import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid2,
  IconButton,
  Stack,
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
  type Definition,
  type Gloss,
  GramCatGroup,
  type SemanticDomain,
  type Sense,
  type WritingSystem,
} from "api/models";
import { PartOfSpeechButton } from "components/Buttons";
import { CancelConfirmDialog } from "components/Dialogs";
import TreeView from "components/TreeView";
import {
  areDefinitionsSame,
  areDomainsSame,
  areGlossesSame,
  cleanSense,
} from "goals/ReviewEntries/ReviewEntriesTable/Cells/EditCell/utilities";
import { useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
import { newSemanticDomainForMongoDB } from "types/semanticDomain";
import { newDefinition, newGloss } from "types/word";
import { TextFieldWithFont } from "utilities/fontComponents";

export enum EditSenseDialogId {
  ButtonCancel = "edit-sense-dialog-cancel-button",
  ButtonCancelDialogCancel = "edit-sense-dialog-cancel-dialog-cancel-button",
  ButtonCancelDialogConfirm = "edit-sense-dialog-cancel-dialog-confirm-button",
  ButtonPartOfSpeech = "edit-sense-dialog-part-of-speech-button",
  ButtonSave = "edit-sense-dialog-save-button",
  ButtonSemDomAdd = "edit-sense-add-semantic-domain-button",
  ButtonSemDomDeletePrefix = "edit-sense-delete-semantic-domain-button-",
  TextFieldDefinitionPrefix = "edit-sense-definition-textfield-",
  TextFieldGlossPrefix = "edit-sense-gloss-textfield-",
}

export enum EditSenseField {
  Definitions,
  Glosses,
  GrammaticalInfo,
  SemanticDomains,
}

type EditSenseFieldChanged = Record<EditSenseField, boolean>;
const defaultEditSenseFieldChanged: EditSenseFieldChanged = {
  [EditSenseField.Definitions]: false,
  [EditSenseField.Glosses]: false,
  [EditSenseField.GrammaticalInfo]: false,
  [EditSenseField.SemanticDomains]: false,
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
  const definitionsEnabled = useAppSelector(
    (state: StoreState) => state.currentProjectState.project.definitionsEnabled
  );
  const grammaticalInfoEnabled = useAppSelector(
    (state: StoreState) =>
      state.currentProjectState.project.grammaticalInfoEnabled
  );

  const [newSense, setNewSense] = useState(props.sense);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [changes, setChanges] = useState(defaultEditSenseFieldChanged);
  const [noDefinitionOrGloss, setNoDefinitionOrGloss] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    setChanges({
      [EditSenseField.Definitions]: !areDefinitionsSame(
        newSense.definitions,
        props.sense.definitions
      ),
      [EditSenseField.Glosses]: !areGlossesSame(
        newSense.glosses,
        props.sense.glosses
      ),
      [EditSenseField.GrammaticalInfo]: false, // not editable
      [EditSenseField.SemanticDomains]: !areDomainsSame(
        newSense.semanticDomains,
        props.sense.semanticDomains
      ),
    });
    setNoDefinitionOrGloss(
      newSense.definitions.every((d) => !d.text.trim()) &&
        newSense.glosses.every((g) => !g.def.trim())
    );
  }, [newSense, props.sense]);

  const bgStyle = (field: EditSenseField): CSSProperties => ({
    backgroundColor: changes[field] ? yellow[50] : grey[200],
  });

  // Functions for updating the edit sense state.
  const updateDefinitions = (definitions: Definition[]): void =>
    setNewSense((prev) => ({ ...prev, definitions }));
  const updateGlosses = (glosses: Gloss[]): void =>
    setNewSense((prev) => ({ ...prev, glosses }));
  const updateDomains = (semanticDomains: SemanticDomain[]): void =>
    setNewSense((prev) => ({ ...prev, semanticDomains }));

  /** Clean up the edited senses and update the parent state. */
  const saveAndClose = (): void => {
    // If no changes, just close
    if (Object.values(changes).every((change) => !change)) {
      cancelAndClose();
      return;
    }

    // Confirm nonempty senses
    const cleanedSense = cleanSense(newSense, { definitionsEnabled });
    if (!cleanedSense || typeof cleanedSense === "string") {
      toast.error(t(cleanedSense || "reviewEntries.error.sense"));
      return;
    }

    // Update in ReviewEntries state
    props.save(cleanedSense);

    // Close
    props.close();
  };

  /** Open dialog to ask to discard changes, or close if no changes. */
  const conditionalCancel = (): void => {
    if (Object.values(changes).some((change) => change)) {
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

  return (
    <>
      <CancelConfirmDialog
        buttonIdCancel={EditSenseDialogId.ButtonCancelDialogCancel}
        buttonIdConfirm={EditSenseDialogId.ButtonCancelDialogConfirm}
        handleCancel={() => setCancelDialog(false)}
        handleConfirm={cancelAndClose}
        open={cancelDialog}
        text="reviewEntries.discardChanges"
      />
      <Dialog fullWidth maxWidth="sm" open={props.isOpen}>
        <DialogTitle>
          <Grid2 container justifyContent="space-between">
            <Typography variant="h6">{t("reviewEntries.editSense")}</Typography>

            <div>
              <IconButton
                id={EditSenseDialogId.ButtonSave}
                onClick={saveAndClose}
              >
                <Check sx={{ color: (t) => t.palette.success.main }} />
              </IconButton>

              <IconButton
                id={EditSenseDialogId.ButtonCancel}
                onClick={conditionalCancel}
              >
                <Close sx={{ color: (t) => t.palette.error.main }} />
              </IconButton>
            </div>
          </Grid2>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            {/* Definitions */}
            {definitionsEnabled && (
              <Card sx={bgStyle(EditSenseField.Definitions)}>
                <CardHeader title={t("reviewEntries.columns.definitions")} />
                <CardContent>
                  <DefinitionList
                    defaultLang={analysisWritingSystems[0]}
                    definitions={newSense.definitions}
                    error={noDefinitionOrGloss}
                    onChange={updateDefinitions}
                    textFieldIdPrefix={
                      EditSenseDialogId.TextFieldDefinitionPrefix
                    }
                  />
                </CardContent>
              </Card>
            )}

            {/* Glosses */}
            <Card sx={bgStyle(EditSenseField.Glosses)}>
              <CardHeader title={t("reviewEntries.columns.glosses")} />
              <CardContent>
                <GlossList
                  defaultLang={analysisWritingSystems[0]}
                  error={noDefinitionOrGloss}
                  glosses={newSense.glosses}
                  onChange={updateGlosses}
                  textFieldIdPrefix={EditSenseDialogId.TextFieldGlossPrefix}
                />
              </CardContent>
            </Card>

            {/* Part of Speech */}
            {grammaticalInfoEnabled && (
              <Card sx={bgStyle(EditSenseField.GrammaticalInfo)}>
                <CardHeader title={t("reviewEntries.columns.partOfSpeech")} />
                <CardContent>
                  {newSense.grammaticalInfo.catGroup ===
                  GramCatGroup.Unspecified ? (
                    <Typography>
                      {t("grammaticalCategory.group.Unspecified")}
                    </Typography>
                  ) : (
                    <PartOfSpeechButton
                      buttonId={EditSenseDialogId.ButtonPartOfSpeech}
                      gramInfo={newSense.grammaticalInfo}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Semantic Domains */}
            <Card sx={bgStyle(EditSenseField.SemanticDomains)}>
              <CardHeader title={t("reviewEntries.columns.domains")} />
              <CardContent>
                <DomainList
                  buttonIdAdd={EditSenseDialogId.ButtonSemDomAdd}
                  buttonIdPrefixDelete={
                    EditSenseDialogId.ButtonSemDomDeletePrefix
                  }
                  domains={newSense.semanticDomains}
                  onChange={updateDomains}
                />
              </CardContent>
            </Card>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface DefinitionListProps {
  defaultLang: WritingSystem;
  definitions: Definition[];
  error?: boolean;
  onChange: (definitions: Definition[]) => void;
  textFieldIdPrefix: string;
}

function DefinitionList(props: DefinitionListProps): ReactElement {
  const definitions = props.definitions.some(
    (d) => d.language === props.defaultLang.bcp47
  )
    ? props.definitions
    : [...props.definitions, newDefinition("", props.defaultLang.bcp47)];

  return (
    <>
      {definitions.map((d, i) => (
        <DefinitionTextField
          definition={d}
          error={props.error}
          key={i}
          onChange={(definition: Definition) => {
            const updated = [...definitions];
            updated.splice(i, 1, definition);
            props.onChange(updated);
          }}
          textFieldId={`${props.textFieldIdPrefix}${i}`}
        />
      ))}
    </>
  );
}

interface DefinitionTextFieldProps {
  definition: Definition;
  error?: boolean;
  textFieldId: string;
  onChange: (definition: Definition) => void;
}

function DefinitionTextField(props: DefinitionTextFieldProps): ReactElement {
  return (
    <TextFieldWithFont
      error={props.error}
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
  error?: boolean;
  glosses: Gloss[];
  onChange: (glosses: Gloss[]) => void;
  textFieldIdPrefix: string;
}

function GlossList(props: GlossListProps): ReactElement {
  const glosses = props.glosses.some(
    (g) => g.language === props.defaultLang.bcp47
  )
    ? props.glosses
    : [...props.glosses, newGloss("", props.defaultLang.bcp47)];

  return (
    <>
      {glosses.map((g, i) => (
        <GlossTextField
          error={props.error}
          gloss={g}
          key={i}
          onChange={(gloss: Gloss) => {
            const updated = [...glosses];
            updated.splice(i, 1, gloss);
            props.onChange(updated);
          }}
          textFieldId={`${props.textFieldIdPrefix}${i}`}
        />
      ))}
    </>
  );
}

interface GlossTextFieldProps {
  error?: boolean;
  gloss: Gloss;
  textFieldId: string;
  onChange: (gloss: Gloss) => void;
}

function GlossTextField(props: GlossTextFieldProps): ReactElement {
  return (
    <TextFieldWithFont
      error={props.error}
      fullWidth
      id={props.textFieldId}
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
  buttonIdAdd: string;
  buttonIdPrefixDelete: string;
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
      <Grid2 alignItems="center" container spacing={2}>
        {props.domains.length > 0 ? (
          props.domains.map((domain, index) => (
            <Chip
              id={`${props.buttonIdPrefixDelete}${index}`}
              key={`${domain.id}_${domain.name}`}
              label={`${domain.id}: ${domain.name}`}
              onDelete={() => deleteDomain(domain.id)}
            />
          ))
        ) : (
          <Grid2 size="grow">
            <Chip color="secondary" label={t("reviewEntries.noDomain")} />
          </Grid2>
        )}

        <IconButton id={props.buttonIdAdd} onClick={() => setAddingDom(true)}>
          <Add />
        </IconButton>
      </Grid2>

      <Dialog fullScreen open={addingDom}>
        <TreeView
          exit={() => setAddingDom(false)}
          returnControlToCaller={addDomain}
        />
      </Dialog>
    </>
  );
}
