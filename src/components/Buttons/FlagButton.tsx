import { Flag as FlagFilled, FlagOutlined } from "@mui/icons-material";
import { Fragment, type ReactElement, useEffect, useState } from "react";

import { type Flag } from "api/models";
import { IconButtonWithTooltip } from "components/Buttons";
import { DeleteEditTextDialog } from "components/Dialogs";

interface FlagButtonProps {
  flag: Flag;
  buttonId?: string;
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
        buttonId={props.buttonId ?? "flag-button"}
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
          buttonIdDelete="flag-remove"
          buttonIdSave="flag-save"
          buttonTextIdDelete="flags.remove"
          buttonTextIdSave="flags.save"
        />
      )}
    </>
  );
}
