import { Flag as FlagFilled, FlagOutlined } from "@material-ui/icons";
import React, { ReactElement, useEffect, useState } from "react";

import { Flag } from "api/models";
import EditTextDialog from "components/Buttons/EditTextDialog";
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
        textId={active ? "mergeDups.flags.edit" : "mergeDups.flags.add"}
        small
        onClick={
          props.updateFlag ? () => setOpen(true) : active ? () => {} : undefined
        }
        buttonId={props.buttonId}
        side="left"
      />
      {props.updateFlag ? (
        <EditTextDialog
          open={open}
          text={props.flag.text}
          titleId="mergeDups.flags.edit"
          close={() => setOpen(false)}
          updateText={updateFlag}
          onCancel={removeFlag}
          buttonIdCancel="flag-remove"
          buttonIdConfirm="flag-save"
          buttonTextIdCancel="mergeDups.flags.remove"
          buttonTextIdConfirm="mergeDups.flags.save"
          allowNoChangeSave
        />
      ) : null}
    </React.Fragment>
  );
}
