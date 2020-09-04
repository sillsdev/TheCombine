import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import * as React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate,
} from "react-localize-redux";

import { CharacterSetEntry } from "../../CharacterInventoryReducer";
import CharacterCard from "./CharacterCard";

export interface CharacterListProps {
  setSelectedCharacter: (character: string) => void;
  allCharacters: CharacterSetEntry[];
}

interface CharacterListState {
  sortOrder: sortOrder;
  fontHeight: number;
  cardWidth: number;
}

enum sortOrder {
  characterAscending,
  characterDescending,
  occurrencesAscending,
  occurrencesDescending,
  status,
}

export class CharacterList extends React.Component<
  CharacterListProps & LocalizeContextProps,
  CharacterListState
> {
  constructor(props: CharacterListProps & LocalizeContextProps) {
    super(props);
    this.state = {
      sortOrder: sortOrder.characterAscending,
      fontHeight: 65,
      cardWidth: 150,
    };
  }

  render() {
    let orderedCharacters = sortBy(
      [...this.props.allCharacters],
      this.state.sortOrder
    );

    return (
      <React.Fragment>
        <Grid item xs={12}>
          <FormControl>
            <InputLabel htmlFor="sort-order">
              <Translate id="charInventory.sortBy" />
            </InputLabel>
            <Select
              value={this.state.sortOrder}
              onChange={(e) =>
                this.setState({ sortOrder: e.target.value as sortOrder })
              }
              inputProps={{
                id: "sort-order",
              }}
            >
              <MenuItem value={sortOrder.characterAscending}>
                {this.props.translate("charInventory.characters")} 🡡
              </MenuItem>
              <MenuItem value={sortOrder.characterDescending}>
                {this.props.translate("charInventory.characters")} 🡣
              </MenuItem>
              <MenuItem value={sortOrder.occurrencesAscending}>
                {this.props.translate("charInventory.occurrences")} 🡡
              </MenuItem>
              <MenuItem value={sortOrder.occurrencesDescending}>
                {this.props.translate("charInventory.occurrences")} 🡣
              </MenuItem>
              <MenuItem value={sortOrder.status}>
                {this.props.translate("charInventory.status")}
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <React.Fragment>
          {
            /* The grid of character tiles */
            orderedCharacters.map((character) => (
              <CharacterCard
                char={character.character}
                key={character.character}
                count={character.occurrences}
                status={character.status}
                onClick={() =>
                  this.props.setSelectedCharacter(character.character)
                }
                fontHeight={this.state.fontHeight}
                cardWidth={this.state.cardWidth}
              />
            ))
          }
        </React.Fragment>
      </React.Fragment>
    );
  }
}

function sortBy(characterSet: CharacterSetEntry[], sort: sortOrder) {
  switch (sort) {
    case sortOrder.characterAscending:
      return characterSet.sort(sortFunction("character"));
    case sortOrder.characterDescending:
      return characterSet.sort(sortFunction("character")).reverse();
    case sortOrder.occurrencesAscending:
      return characterSet.sort(sortFunction("occurrences"));
    case sortOrder.occurrencesDescending:
      return characterSet.sort(sortFunction("occurrences")).reverse();
    case sortOrder.status:
      return characterSet.sort(sortFunction("status"));
    default:
      return characterSet;
  }
}

function sortFunction<K extends keyof CharacterSetEntry>(prop: K) {
  return (a: CharacterSetEntry, b: CharacterSetEntry) => {
    if (a[prop] < b[prop]) return -1;
    if (a[prop] > b[prop]) return 1;
    return 0;
  };
}

export default withLocalize(CharacterList);
