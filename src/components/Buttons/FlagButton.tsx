import { Flag as FlagFilled, FlagOutlined } from "@mui/icons-material";
import { Fragment, type ReactElement, useEffect, useState } from "react";

import { type Flag } from "api/models";
import IconButtonWithTooltip from "components/Buttons/IconButtonWithTooltip";
import DeleteEditTextDialog from "components/Dialogs/DeleteEditTextDialog";

interface FlagButtonProps {
  buttonId?: string;
  buttonLabel?: string;
  flag: Flag;
  updateFlag?: (flag: Flag) => void | Promise<void>;
}

/** A flag adding/editing/viewing button */
export default function FlagButton(props: FlagButtonProps): ReactElement {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(false);
  const [text, setText] = useState<string | undefined>();

  useEffect(() => {
    setActive(props.flag.active);
    setText(props.flag.active ? props.flag.text : undefined);
  }, [props.flag]);

  async function updateFlag(text: string): Promise<void> {
    await props.updateFlag?.({ active: true, text });
    setActive(true);
    setText(text);
  }

  async function removeFlag(): Promise<void> {
    await props.updateFlag?.({ active: false, text: "" });
    setActive(false);
    setText(undefined);
  }

  return (
    <>
      <IconButtonWithTooltip
        buttonId={props.buttonId}
        buttonLabel={props.buttonLabel ?? "Flag"}
        icon={
          active ? (
            <FlagFilled sx={{ color: (t) => t.palette.error.main }} />
          ) : props.updateFlag ? (
            <FlagOutlined />
          ) : (
            <Fragment />
          )
        }
        text={text}
        textId={active ? "flags.edit" : "flags.add"}
        size="small"
        onClick={props.updateFlag ? () => setOpen(true) : undefined}
        side="top"
      />
      {props.updateFlag && (
        <DeleteEditTextDialog
          open={open}
          text={props.flag.text}
          titleId="flags.edit"
          close={() => setOpen(false)}
          updateText={updateFlag}
          onDelete={removeFlag}
          buttonIdCancel="flag-cancel"
          buttonIdClear="flag-clear"
          buttonIdDelete="flag-remove"
          buttonIdSave="flag-save"
          buttonTextIdDelete="flags.remove"
          buttonTextIdSave="flags.save"
        />
      )}
    </>
  );
}
