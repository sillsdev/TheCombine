import { Card, CardActionArea, CardContent, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import CharacterStatusText from "goals/CharacterInventory/CharInv/CharacterList/CharacterStatusText";
import { CharacterStatus } from "goals/CharacterInventory/CharacterInventoryTypes";
import { TypographyWithFont } from "utilities/fontComponents";

interface CharacterCardProps {
  char: string;
  count: number;
  status: CharacterStatus;
  onClick?: () => void;
  fontHeight: number;
  cardWidth: number;
}

export default function CharacterCard(props: CharacterCardProps): ReactElement {
  const { t } = useTranslation();

  return (
    <Card onClick={props.onClick} sx={{ m: 1, maxWidth: props.cardWidth }}>
      <CardActionArea>
        <TypographyWithFont
          align="center"
          id="character"
          sx={{ height: props.fontHeight, pt: 1 }}
          variant="h2"
          vernacular
        >
          {props.char}
          {""}
          {/* There is a zero-width joiner here to make height consistent for non-printing characters. */}
        </TypographyWithFont>

        <CardContent>
          <Typography gutterBottom variant="h6" component="h2">
            {charToHexValue(props.char)}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            {t("charInventory.characterSet.occurrences", { val: props.count })}
          </Typography>
          <CharacterStatusText status={props.status} />
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function charToHexValue(char: string): string {
  let hex: string = char.charCodeAt(0).toString(16).toUpperCase();
  while (hex.length < 4) {
    hex = "0" + hex;
  }
  return "U+" + hex;
}
