import { Flag as FlagFilled, FlagOutlined } from "@material-ui/icons";
import React, { ReactElement, useEffect, useState } from "react";

import { Flag } from "api/models";
import DeleteEditTextDialog from "components/Buttons/DeleteEditTextDialog";
import IconButtonWithTooltip from "components/Buttons/IconButtonWithTooltip";
import { themeColors } from "types/theme";

interface FlagButtonProps {
  flag: Flag;
  updateFlag?: (flag: Flag) => void;
  buttonId?: string;
}

export default function FlagButton(props: FlagButtonProps): ReactElement {
  const [open, setOpen] = useState<boolean>(false);
  const [active, setActive] = useState<boolean>();
  const [text, setText] = useState<string | undefined>();

  useEffect(() => {
    setActive(props.flag.active);
    setText(props.flag.active ? props.flag.text : undefined);
  }, [props.flag, setActive, setText]);

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
    <React.Fragment>
      <IconButtonWithTooltip
        icon={
          active ? (
            <FlagFilled style={{ color: themeColors.error }} />
          ) : props.updateFlag ? (
            <FlagOutlined />
          ) : (
            <div />
          )
        }
        text={text}
        textId={active ? "flags.edit" : "flags.add"}
        small
        onClick={
          props.updateFlag ? () => setOpen(true) : active ? () => {} : undefined
        }
        buttonId={props.buttonId}
        side="left"
      />
      {props.updateFlag ? (
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
      ) : null}
    </React.Fragment>
  );
}
