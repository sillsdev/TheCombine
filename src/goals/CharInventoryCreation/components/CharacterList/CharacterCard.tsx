import React from "react";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import theme from "../../../../types/theme";

export interface CharacterCardProps {
  char: string;
}

const useStyles = makeStyles(
  createStyles({
    header: {
      marginLeft: theme.spacing(1)
    },
    card: {
      maxWidth: 345,
      margin: theme.spacing(1)
    },
    media: {
      height: 140
    }
  })
);

export default function CharacterCard(props: CharacterCardProps) {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardActionArea>
        <Typography variant="h1" className={classes.header}>
          {props.char}
        </Typography>
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {charToHexValue(props.char)}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            190 occurrences
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function charToHexValue(char: string) {
  let hex: string = char
    .charCodeAt(0)
    .toString(16)
    .toUpperCase();
  while (hex.length < 4) {
    hex = "0" + hex;
  }
  return "U+" + hex;
}
