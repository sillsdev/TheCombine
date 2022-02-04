import { Flag as FlagFilled, FlagOutlined } from "@material-ui/icons";
import React, { ReactElement, useState } from "react";

import { Flag } from "api/models";
import EditTextDialog from "components/Buttons/EditTextDialog";
import IconButtonWithTooltip from "components/Buttons/IconButtonWithTooltip";
import { themeColors } from "types/theme";

interface FlagButtonProps {
  flag: Flag;
  updateFlag: (flag: Flag) => void;
  buttonId?: string;
}

export default function FlagButton(props: FlagButtonProps): ReactElement {
  const [open, setOpen] = useState<boolean>(false);
  const [active, setActive] = useState<boolean>(props.flag.active);
  const [text, setText] = useState<string>(props.flag.text);

  function updateFlag(text: string): void {
    setActive(true);
    setText(text);
    props.updateFlag({ active, text });
  }

  function removeFlag(): void {
    setActive(false);
    setText("");
    props.updateFlag({ active, text });
  }

  return (
    <React.Fragment>
      <IconButtonWithTooltip
        icon={
          active ? (
            <FlagFilled style={{ color: themeColors.error }} />
          ) : (
            <FlagOutlined />
          )
        }
        textId={active ? "mergeDups.flags.edit" : "mergeDups.flags.add"}
        onClick={() => setOpen(true)}
        buttonId={props.buttonId}
      />
      <EditTextDialog
        open={open}
        text={text}
        titleId="mergeDups.flags.edit"
        close={() => setOpen(false)}
        updateText={updateFlag}
        onCancel={removeFlag}
        buttonIdCancel="flag-remove"
        buttonIdConfirm="flag-save"
        buttonTextIdCancel="mergeDups.flags.remove"
        buttonTextIdConfirm="mergeDups.flags.save"
      />
    </React.Fragment>
  );
}
