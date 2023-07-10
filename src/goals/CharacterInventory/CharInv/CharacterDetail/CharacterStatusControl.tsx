import { Button, ButtonGroup } from "@mui/material";
import { useTranslation } from "react-i18next";

import { CharacterStatus } from "goals/CharacterInventory/CharacterInventoryTypes";
import { setCharacterStatus } from "goals/CharacterInventory/Redux/CharacterInventoryActions";
import { useAppDispatch } from "types/hooks";

interface CharacterStatusControlProps {
  character: string;
}

export default function CharacterStatusControl(
  props: CharacterStatusControlProps,
) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const accept = (): void => {
    dispatch(setCharacterStatus(props.character, CharacterStatus.Accepted));
  };
  const reject = (): void => {
    dispatch(setCharacterStatus(props.character, CharacterStatus.Rejected));
  };
  const unset = (): void => {
    dispatch(setCharacterStatus(props.character, CharacterStatus.Undecided));
  };

  return (
    <ButtonGroup
      variant="contained"
      size="small"
      aria-label="small outlined secondary button group"
    >
      <Button onClick={accept}>{t("buttons.accept")}</Button>
      <Button onClick={unset}>{t("buttons.undecided")}</Button>
      <Button onClick={reject}>{t("buttons.reject")}</Button>
    </ButtonGroup>
  );
}
