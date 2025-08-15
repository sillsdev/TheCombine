import { Flag as FlagFilled, FlagOutlined } from "@mui/icons-material";
import { Fragment, type ReactElement, useEffect, useState } from "react";

import { type Flag } from "api/models";
import IconButtonWithTooltip from "components/Buttons/IconButtonWithTooltip";
import { DeleteEditTextDialog } from "components/Dialogs";

interface FlagButtonProps {
  buttonId?: string;
  buttonLabel?: string;
  flag: Flag;
  updateFlag?: (flag: Flag) => void;
}

/** A flag adding/editing/viewing button */
export default function FlagButton(props: FlagButtonProps): ReactElement {
  const [open, setOpen] = useState<boolean>(false);
  const [active, setActive] = useState<boolean>();
  const [text, setText] = useState<string | undefined>();

  useEffect(() => {
    setActive(props.flag.active);
    setText(props.flag.active ? props.flag.text : undefined);
  }, [props.flag]);

  function updateFlag(text: string): void {
    setActive(true);
    setText(text);
    if (props.updateFlag) {
      props.updateFlag({ active: true, text });
    }
  }

  function removeFlag(): void {
    setActive(false);
    setText(undefined);
    if (props.updateFlag) {
      props.updateFlag({ active: false, text: "" });
    }
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
