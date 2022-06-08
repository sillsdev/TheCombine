import { Button, ButtonGroup } from "@material-ui/core";
import React from "react";
import { useTranslation } from "react-i18next";

interface CharacterStatusControlProps {
  character: string;
  accept: (character: string) => void;
  unset: (character: string) => void;
  reject: (character: string) => void;
}

export default function CharacterStatusControl(
  props: CharacterStatusControlProps
) {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <ButtonGroup
        variant="contained"
        size="small"
        aria-label="small outlined secondary button group"
      >
        <Button onClick={() => props.accept(props.character)}>
          {t("buttons.accept")}
        </Button>
        <Button onClick={() => props.unset(props.character)}>
          {t("buttons.undecided")}
        </Button>
        <Button onClick={() => props.reject(props.character)}>
          {t("buttons.reject")}
        </Button>
      </ButtonGroup>
    </React.Fragment>
  );
}
