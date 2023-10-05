import { Card, CardActionArea, CardContent, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import CharacterStatusText from "goals/CharacterInventory/CharInv/CharacterList/CharacterStatusText";
import { CharacterStatus } from "goals/CharacterInventory/CharacterInventoryTypes";
import theme from "types/theme";
import { TypographyWithFont } from "utilities/fontComponents";

interface CharacterCardProps {
  char: string;
  count: number;
  status: CharacterStatus;
  onClick?: () => void;
  fontHeight: number;
  cardWidth: number;
}

export default function CharacterCard(props: CharacterCardProps) {
  const { t } = useTranslation();

  return (
    <Card
      style={{ maxWidth: props.cardWidth, margin: theme.spacing(1) }}
      onClick={props.onClick}
    >
      <CardActionArea>
        <TypographyWithFont
          align="center"
          id="character"
          style={{
            height: props.fontHeight,
            marginLeft: theme.spacing(1),
            paddingTop: theme.spacing(1),
          }}
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
