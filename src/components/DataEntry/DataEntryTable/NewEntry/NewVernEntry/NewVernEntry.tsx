import React from "react";
import {
  TextField,
  Dialog,
  DialogContent,
  MenuItem,
  MenuList,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { Word } from "../../../../../types/word";
import {
  LocalizeContextProps,
  Translate,
  withLocalize,
} from "react-localize-redux";

import DupFinder from "../../../../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";
import SenseCell from "../../../../../goals/ReviewEntries/ReviewEntriesComponent/CellComponents/SenseCell";
import DomainCell from "../../../../../goals/ReviewEntries/ReviewEntriesComponent/CellComponents/DomainCell";
import { parseWord } from "../../../../../goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";

interface NewVernEntryProps {
  vernacular: string;
  vernInput: React.RefObject<HTMLDivElement>;
  updateVernField: (newValue: string) => void;
  allWords: Word[];
  updateWordId: (wordId: string) => void;
}
interface NewVernEntryState {
  open: boolean;
  allVerns: string[];
  suggestedVerns: string[];
  duplicateVerns: Word[];
  selectedVernacular?: Word;
}

/**
 * An editable vernacular field for new words
 */
export class NewVernEntry extends React.Component<
  LocalizeContextProps & NewVernEntryProps,
  NewVernEntryState
> {
  readonly maxSuggestions = 5;
  vernListRef: React.RefObject<HTMLDivElement>;
  suggestionFinder: DupFinder = new DupFinder();

  constructor(props: any) {
    super(props);
    this.state = {
      open: false,
      allVerns: [],
      duplicateVerns: [],
      suggestedVerns: [],
    };
    this.vernListRef = React.createRef();
  }

  updateSuggestedVerns(value?: string | null) {
    if (!this.state.allVerns.length) {
      const allVerns: string[] = this.props.allWords.map(
        (word: Word) => word.vernacular
      );
      this.setState({ allVerns });
    }
    let suggestedVerns: string[] = [];
    if (value) {
      const sortedVerns: string[] = this.state.allVerns.sort(
        (a: string, b: string) =>
          this.suggestionFinder.getLevenshteinDistance(a, value) -
          this.suggestionFinder.getLevenshteinDistance(b, value)
      );
      suggestedVerns = sortedVerns.slice(0, this.maxSuggestions);
    }
    this.setState({ suggestedVerns });
  }

  render() {
    return (
      <div>
        <Autocomplete
          freeSolo
          id="newvernentry"
          value={this.props.vernacular}
          options={this.state.suggestedVerns}
          renderInput={(params) => (
            <TextField
              {...params}
              label={<Translate id="addWords.vernacular" />}
              variant="outlined"
              fullWidth
            />
          )}
          onChange={(_event, value) => {
            if (value === null) {
              this.setState({
                duplicateVerns: [],
                selectedVernacular: undefined,
              });
            } else {
              this.props.updateVernField(value);
              let duplicateVerns: Word[] = this.props.allWords.filter(
                (word) => value === word.vernacular
              );
              if (duplicateVerns.length > 0) {
                this.setState({ open: true, duplicateVerns });
              } else {
                this.setState({ selectedVernacular: undefined });
              }
            }
            this.updateSuggestedVerns(value);
          }}
          onInputChange={(_event, value) => {
            this.props.updateVernField(value);
            this.updateSuggestedVerns(value);
          }}
        />
        <VernDialog
          open={this.state.open}
          handleClose={(selectedIndex: number) => {
            //set new vernacular to
            if (selectedIndex === this.state.duplicateVerns.length) {
              //New Entry Here
            } else {
              this.setState({
                open: false,
                selectedVernacular: this.state.duplicateVerns[selectedIndex],
              });
            }
          }}
          vernacularWords={this.state.duplicateVerns}
          vernListRef={this.vernListRef}
        />
      </div>
    );
  }
}

export default withLocalize(NewVernEntry);

function VernDialog(props: {
  vernacularWords: Word[];
  open: boolean;
  handleClose: (selectedIndex: number) => void;
  vernListRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <Dialog
      open={props.open}
      onClose={props.handleClose}
      disableBackdropClick
      disableEscapeKeyDown
    >
      <DialogContent>
        <VernList
          vernacularWords={props.vernacularWords}
          vernListRef={props.vernListRef}
          closeDialog={props.handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
interface VernListProps {
  vernacularWords: Word[];
  vernListRef: React.RefObject<HTMLDivElement>;
  closeDialog: (selectedIndex: number) => void;
}
interface VernListState {
  selectedIndex: number;
}
class VernList extends React.Component<VernListProps, VernListState> {
  // constructor() {
  //   super(props);

  // }
  render() {
    return (
      <React.Fragment>
        <h1>Select the desired vernacular</h1>
        <MenuList
          autoFocusItem={true}
          onKeyDown={(e: React.KeyboardEvent<HTMLUListElement>) => {
            if (e.key === "Enter") {
              // TODO Save vern (set new entry)
              this.props.closeDialog(0); //TODO change this
            }
          }}
          //onChange={(event: object, value: any) => this.setState({selectedWord: value})}
        >
          {this.props.vernacularWords.map((word: Word) => (
            <MenuItem>
              {<h4>{word.vernacular}</h4>}
              <SenseCell
                editable={false}
                sortingByGloss={true}
                value={parseWord(word, "en").senses}
                rowData={parseWord(word, "en")}
              />
              <DomainCell
                rowData={parseWord(word, "en")}
                sortingByDomains={false}
              />
            </MenuItem>
          ))}

          <MenuItem>
            {"New Entry for " + this.props.vernacularWords[0].vernacular}
          </MenuItem>
        </MenuList>
      </React.Fragment>
    );
  }
}
