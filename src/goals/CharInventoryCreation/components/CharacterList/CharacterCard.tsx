import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from "@material-ui/core";
import React, { ReactElement } from "react";
import { Translate } from "react-localize-redux";

import { CharacterStatus } from "goals/CharInventoryCreation/Redux/CharacterInventoryReduxTypes";
import CharacterStatusText from "goals/CharInventoryCreation/components/CharacterList/CharacterStatusText";
import theme from "types/theme";

interface CharacterCardProps {
  char: string;
  count: number;
  status: CharacterStatus;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  fontHeight: number;
  cardWidth: number;
}

export default class CharacterCard extends React.Component<CharacterCardProps> {
  render(): ReactElement {
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
              {/* There is a zero-width joiner here to make height consistent for non-printing characters. */}
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

function charToHexValue(char: string): string {
  let hex: string = char.charCodeAt(0).toString(16).toUpperCase();
  while (hex.length < 4) {
    hex = "0" + hex;
  }
  return "U+" + hex;
}
