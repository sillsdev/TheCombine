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
  sortOrder: SortOrder;
  fontHeight: number;
  cardWidth: number;
}

enum SortOrder {
  CharacterAscending,
  CharacterDescending,
  OccurrencesAscending,
  OccurrencesDescending,
  Status,
}

export class CharacterList extends React.Component<
  CharacterListProps & LocalizeContextProps,
  CharacterListState
> {
  constructor(props: CharacterListProps & LocalizeContextProps) {
    super(props);
    this.state = {
      sortOrder: SortOrder.CharacterAscending,
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
                this.setState({ sortOrder: e.target.value as SortOrder })
              }
              inputProps={{
                id: "sort-order",
              }}
            >
              <MenuItem value={SortOrder.CharacterAscending}>
                {this.props.translate("charInventory.characters")} 🡡
              </MenuItem>
              <MenuItem value={SortOrder.CharacterDescending}>
                {this.props.translate("charInventory.characters")} 🡣
              </MenuItem>
              <MenuItem value={SortOrder.OccurrencesAscending}>
                {this.props.translate("charInventory.occurrences")} 🡡
              </MenuItem>
              <MenuItem value={SortOrder.OccurrencesDescending}>
                {this.props.translate("charInventory.occurrences")} 🡣
              </MenuItem>
              <MenuItem value={SortOrder.Status}>
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

function sortBy(characterSet: CharacterSetEntry[], sort: SortOrder) {
  switch (sort) {
    case SortOrder.CharacterAscending:
      return characterSet.sort(sortFunction("character"));
    case SortOrder.CharacterDescending:
      return characterSet.sort(sortFunction("character")).reverse();
    case SortOrder.OccurrencesAscending:
      return characterSet.sort(sortFunction("occurrences"));
    case SortOrder.OccurrencesDescending:
      return characterSet.sort(sortFunction("occurrences")).reverse();
    case SortOrder.Status:
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
