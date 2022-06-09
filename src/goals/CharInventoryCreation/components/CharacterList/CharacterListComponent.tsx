import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import { ArrowDownward, ArrowUpward } from "@material-ui/icons";
import React, { ReactElement } from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import { CharacterSetEntry } from "goals/CharInventoryCreation/Redux/CharacterInventoryReduxTypes";
import CharacterCard from "goals/CharInventoryCreation/components/CharacterList/CharacterCard";

interface CharacterListProps extends WithTranslation {
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
  CharacterListProps,
  CharacterListState
> {
  constructor(props: CharacterListProps) {
    super(props);
    this.state = {
      sortOrder: SortOrder.CharacterAscending,
      fontHeight: 65,
      cardWidth: 150,
    };
  }

  render(): ReactElement {
    const orderedCharacters = sortBy(
      [...this.props.allCharacters],
      this.state.sortOrder
    );

    return (
      <React.Fragment>
        <Grid item xs={12}>
          <FormControl>
            <InputLabel htmlFor="sort-order">
              {this.props.t("charInventory.sortBy")}
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
                {this.props.t("charInventory.characters")}
                <ArrowUpward fontSize="small" />
              </MenuItem>
              <MenuItem value={SortOrder.CharacterDescending}>
                {this.props.t("charInventory.characters")}
                <ArrowDownward fontSize="small" />
              </MenuItem>
              <MenuItem value={SortOrder.OccurrencesAscending}>
                {this.props.t("charInventory.occurrences")}
                <ArrowUpward fontSize="small" />
              </MenuItem>
              <MenuItem value={SortOrder.OccurrencesDescending}>
                {this.props.t("charInventory.occurrences")}
                <ArrowDownward fontSize="small" />
              </MenuItem>
              <MenuItem value={SortOrder.Status}>
                {this.props.t("charInventory.status")}
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

function sortBy(
  characterSet: CharacterSetEntry[],
  sort: SortOrder
): CharacterSetEntry[] {
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
  return (a: CharacterSetEntry, b: CharacterSetEntry): number =>
    a[prop] < b[prop] ? -1 : a[prop] > b[prop] ? 1 : 0;
}

export default withTranslation()(CharacterList);
