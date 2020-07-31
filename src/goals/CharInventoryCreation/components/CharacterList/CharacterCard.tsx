import React from "react";
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
  fontHeight: number;
  cardWidth: number;
}

interface CharacterCardStates {}

function charToHexValue(char: string) {
  let hex: string = char.charCodeAt(0).toString(16).toUpperCase();
  while (hex.length < 4) {
    hex = "0" + hex;
  }
  return "U+" + hex;
}

export class CharacterCard extends React.Component<
  CharacterCardProps,
  CharacterCardStates
> {
  render() {
    return (
      <React.Fragment>
        <Card
          style={{
            maxWidth: this.props.cardWidth,
            margin: theme.spacing(1),
          }}
          onClick={this.props.onClick}
        >
          <CardActionArea>
            <Typography
              variant="h2"
              align="center"
              style={{
                height: this.props.fontHeight,
                marginLeft: theme.spacing(1),
                paddingTop: theme.spacing(1),
              }}
              id="character"
            >
              {this.props.char}
              {""}
            </Typography>

            <CardContent>
              <Typography gutterBottom variant="h6" component="h2">
                {charToHexValue(this.props.char)}
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p">
                {this.props.count}{" "}
                <Translate id="charInventory.characterSet.occurrences" />
              </Typography>
              <CharacterStatusText status={this.props.status} />
            </CardContent>
          </CardActionArea>
        </Card>
      </React.Fragment>
    );
  }
}
