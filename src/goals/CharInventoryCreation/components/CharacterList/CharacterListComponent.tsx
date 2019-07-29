import * as React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate
} from "react-localize-redux";
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@material-ui/core";
import CharacterCard from "./CharacterCard";
import { listChar } from "../../CharacterInventoryReducer";
import { ArrowUpward } from "@material-ui/icons";

export interface CharacterListProps {
  setSelectedCharacter: (character: string) => void;
  allCharacters: listChar[];
}

interface CharacterListState {
  hoverChar: string;
  sortOrder: sortOrder;
}

enum sortOrder {
  characterAscending,
  characterDescending,
  occurrencesAscending,
  occurrencesDescending,
  status
}

export class CharacterList extends React.Component<
  CharacterListProps & LocalizeContextProps,
  CharacterListState
> {
  constructor(props: CharacterListProps & LocalizeContextProps) {
    super(props);
    this.state = {
      hoverChar: "",
      sortOrder: sortOrder.characterAscending
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
              onChange={e =>
                this.setState({ sortOrder: e.target.value as sortOrder })
              }
              inputProps={{
                id: "sort-order"
              }}
            >
              <MenuItem value={sortOrder.characterAscending}>
                <Translate id="charInventory.characters" /> 🡡
              </MenuItem>
              <MenuItem value={sortOrder.characterDescending}>
                <Translate id="charInventory.characters" /> 🡣
              </MenuItem>
              <MenuItem value={sortOrder.occurrencesAscending}>
                <Translate id="charInventory.occurrences" /> 🡡
              </MenuItem>
              <MenuItem value={sortOrder.occurrencesDescending}>
                <Translate id="charInventory.occurrences" /> 🡣
              </MenuItem>
              <MenuItem value={sortOrder.status}>
                <Translate id="charInventory.status" />
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <React.Fragment>
          {/* The grid of character tiles */

          orderedCharacters.map(character => (
            <CharacterCard
              char={character.character}
              key={character.character}
              count={character.occurrences}
              status={character.status}
              onClick={() =>
                this.props.setSelectedCharacter(character.character)
              }
            />
          ))}
        </React.Fragment>
      </React.Fragment>
    );
  }
}

function sortBy(characterSet: listChar[], sort: sortOrder) {
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

function sortFunction<K extends keyof listChar>(prop: K) {
  return (a: listChar, b: listChar) => {
    if (a[prop] < b[prop]) return -1;
    if (a[prop] > b[prop]) return 1;
    return 0;
  };
}

export default withLocalize(CharacterList);
