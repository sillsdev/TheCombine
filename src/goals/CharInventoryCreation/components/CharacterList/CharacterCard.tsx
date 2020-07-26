import React from "react";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import theme from "../../../../types/theme";
import CharacterStatusText from "./CharacterStatusText";
import { Translate } from "react-localize-redux";
import { characterStatus } from "../../CharacterInventoryReducer";

export interface CharacterCardProps {
  char: string;
  count: number;
  status: characterStatus;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const useStyles = makeStyles(
  createStyles({
    header: {
      marginLeft: theme.spacing(1),
    },
    card: {
      maxWidth: 345,
      margin: theme.spacing(1),
    },
  })
);

export default function CharacterCard(props: CharacterCardProps) {
  const classes = useStyles();

  return (
    <Card className={classes.card} onClick={props.onClick}>
      <CardActionArea>
        <Typography variant="h1" className={classes.header}>
          {props.char}
          {/* There is a zero-width joiner here to make height consistent for non-printing characters: */}
          {"‍"}
        </Typography>
        <CardContent>
          <Typography gutterBottom variant="h6" component="h2">
            {charToHexValue(props.char)}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            {props.count}{" "}
            <Translate id="charInventory.characterSet.occurrences" />
          </Typography>
          <CharacterStatusText status={props.status} />
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function charToHexValue(char: string) {
  let hex: string = char.charCodeAt(0).toString(16).toUpperCase();
  while (hex.length < 4) {
    hex = "0" + hex;
  }
  return "U+" + hex;
}
