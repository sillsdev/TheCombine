import {
  Add,
  ArrowDownward,
  ArrowUpward,
  Delete,
  Edit,
  RestoreFromTrash,
} from "@mui/icons-material";
import { CardContent, Divider, Grid, Icon } from "@mui/material";
import { grey, yellow } from "@mui/material/colors";
import { type ReactElement, useEffect, useState } from "react";

import { type Sense, Status } from "api/models";
import { IconButtonWithTooltip } from "components/Buttons";
import SenseCard from "components/WordCard/SenseCard";
import SummarySenseCard from "components/WordCard/SummarySenseCard";
import EditSenseDialog from "goals/ReviewEntries/ReviewEntriesTable/Cells/EditCell/EditSenseDialog";
import { isSenseChanged } from "goals/ReviewEntries/ReviewEntriesTable/Cells/EditCell/utilities";
import { newSense } from "types/word";

enum EditSensesId {
  ButtonSenseAdd = "add-sense-button",
  ButtonSenseBumpDownPrefix = "bump-up-sense-button-",
  ButtonSenseBumpUpPrefix = "bump-down-sense-button-",
  ButtonSenseDeletePrefix = "delete-sense-button-",
  ButtonSenseEditPrefix = "edit-sense-button-",
  ButtonSenseRestorePrefix = "restore-sense-button-",
}

interface EditSensesCardContentProps {
  moveSense: (from: number, to: number) => void;
  newSenses: Sense[];
  oldSenses: Sense[];
  showSenses: boolean;
  toggleSenseDeleted: (index: number) => void;
  updateOrAddSense: (sense: Sense) => void;
}

export default function EditSensesCardContent(
  props: EditSensesCardContentProps
): ReactElement {
  const [addSense, setAddSense] = useState(false);
  const [changes, setChanges] = useState<boolean[]>([]);

  useEffect(() => {
    setChanges(
      props.newSenses.map((sense, index) =>
        index < props.oldSenses.length
          ? isSenseChanged(sense, props.oldSenses[index])
          : true
      )
    );
  }, [props.newSenses, props.oldSenses]);

  return (
    <CardContent>
      {props.showSenses ? (
        <>
          {props.newSenses.map((s, i) => (
            <EditSense
              bumpSenseDown={
                i < props.newSenses.length - 1
                  ? () => props.moveSense(i, i + 1)
                  : undefined
              }
              bumpSenseUp={i ? () => props.moveSense(i, i - 1) : undefined}
              edited={changes[i]}
              key={s.guid}
              sense={s}
              toggleSenseDeleted={() => props.toggleSenseDeleted(i)}
              updateSense={props.updateOrAddSense}
            />
          ))}
          <IconButtonWithTooltip
            buttonId={EditSensesId.ButtonSenseAdd}
            icon={<Add />}
            onClick={() => setAddSense(true)}
            size="small"
          />
          <EditSenseDialog
            close={() => setAddSense(false)}
            isOpen={addSense}
            save={props.updateOrAddSense}
            sense={newSense()}
          />
        </>
      ) : (
        <SummarySenseCard
          bgcolor={changes.some((change) => change) ? yellow[100] : undefined}
          senses={props.newSenses.filter(
            (s) => s.accessibility !== Status.Deleted
          )}
        />
      )}
    </CardContent>
  );
}

interface EditSenseProps {
  edited?: boolean;
  sense: Sense;
  bumpSenseDown?: () => void;
  bumpSenseUp?: () => void;
  toggleSenseDeleted: () => void;
  updateSense: (sense: Sense) => void;
}

export function EditSense(props: EditSenseProps): ReactElement {
  const sense = props.sense;
  const deleted = sense.accessibility === Status.Deleted;
  const [editing, setEditing] = useState(false);

  return (
    <>
      <Grid container>
        {props.bumpSenseDown || props.bumpSenseUp ? (
          <Grid item>
            <Grid container direction="column">
              <Grid item>
                <IconButtonWithTooltip
                  buttonId={`${EditSensesId.ButtonSenseBumpUpPrefix}${sense.guid}`}
                  icon={props.bumpSenseUp ? <ArrowUpward /> : <Icon />}
                  onClick={props.bumpSenseUp}
                  size="small"
                />
              </Grid>
              <Grid item>
                <IconButtonWithTooltip
                  buttonId={`${EditSensesId.ButtonSenseBumpDownPrefix}${sense.guid}`}
                  icon={props.bumpSenseDown ? <ArrowDownward /> : <Icon />}
                  onClick={props.bumpSenseDown}
                  size="small"
                />
              </Grid>
            </Grid>
          </Grid>
        ) : null}
        <Grid item>
          <Grid container direction="column">
            {deleted ? (
              <Grid item>
                <IconButtonWithTooltip
                  buttonId={`${EditSensesId.ButtonSenseRestorePrefix}${sense.guid}`}
                  icon={<RestoreFromTrash />}
                  onClick={props.toggleSenseDeleted}
                  size="small"
                />
              </Grid>
            ) : (
              <>
                <Grid item>
                  <IconButtonWithTooltip
                    buttonId={`${EditSensesId.ButtonSenseDeletePrefix}${sense.guid}`}
                    icon={<Delete />}
                    onClick={
                      sense.accessibility === Status.Protected
                        ? undefined
                        : props.toggleSenseDeleted
                    }
                    size="small"
                    textId={
                      sense.accessibility === Status.Protected
                        ? "reviewEntries.deleteDisabled"
                        : undefined
                    }
                  />
                </Grid>
                <Grid item>
                  <IconButtonWithTooltip
                    buttonId={`${EditSensesId.ButtonSenseEditPrefix}${sense.guid}`}
                    icon={<Edit />}
                    onClick={() => setEditing(true)}
                    size="small"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Grid>
        <Grid item sx={{ maxWidth: `calc(100% - 80px)` }}>
          <SenseCard
            bgColor={
              deleted ? grey[500] : props.edited ? yellow[100] : undefined
            }
            sense={sense}
          />
        </Grid>
        <EditSenseDialog
          close={() => setEditing(false)}
          isOpen={editing}
          save={props.updateSense}
          sense={sense}
        />
      </Grid>
      <Divider sx={{ mb: 1 }} />
    </>
  );
}
