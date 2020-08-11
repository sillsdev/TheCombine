import React from "react";
import {
  Popper,
  TextField,
  Dialog,
  DialogContent,
  MenuList,
  MenuItem,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { Word, simpleWord } from "../../../../../types/word";
import {
  Translate,
  LocalizeContextProps,
  withLocalize,
} from "react-localize-redux";
import SenseCell from "../../../../../goals/ReviewEntries/ReviewEntriesComponent/CellComponents/SenseCell";
import DomainCell from "../../../../../goals/ReviewEntries/ReviewEntriesComponent/CellComponents/DomainCell";
import {
  ReviewEntriesWord,
  parseWord,
} from "../../../../../goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";

interface NewVernEntryProps {
  vernacular: string;
  vernInput: React.RefObject<HTMLDivElement>;
  updateVernField: (newValue: string) => void;
  newEntry: Word;
  allWords: Word[];
  updateNewEntry: (newEntry: Word) => void;
}
interface NewVernEntryState {
  open: boolean;
  selectedVernacularWord: Word;
}

/**
 * An editable vernacular field for new words
 */
export class NewVernEntry extends React.Component<
  LocalizeContextProps & NewVernEntryProps,
  NewVernEntryState
> {
  vernListRef: React.RefObject<HTMLDivElement>;
  constructor(props: any) {
    super(props);
    this.state = {
      open: false,
      selectedVernacularWord: simpleWord("", ""),
    };
    this.vernListRef = React.createRef();
  }
  render() {
    const CustomDropdown = function (props: any) {
      return (
        <Popper {...props} style={{ width: 600 }} placement="bottom-start" />
      );
    };
    return (
      <div>
        <Autocomplete
          freeSolo
          //PopperComponent={CustomDropdown}
          id="newvernentry"
          value={this.props.vernacular}
          options={this.props.allWords}
          getOptionLabel={(option) => option.vernacular}
          renderOption={(option, _state) => option.vernacular}
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
              console.log("NULL SELECTION");
              this.setState({
                open: true,
                selectedVernacularWord: simpleWord("vern", "gloss"),
              });
            } else if (typeof value === "string") {
              console.log("STRING SELECTION");
              this.setState({
                open: true,
                selectedVernacularWord: simpleWord("vern", "gloss"),
              });
            } else {
              this.setState({ open: true, selectedVernacularWord: value });
            }
          }}
        />
        <VernDialog
          open={this.state.open}
          handleClose={() => this.setState({ open: false })}
          vernacularWord={this.state.selectedVernacularWord}
          vernListRef={this.vernListRef}
        />
      </div>
    );
  }
}

export default withLocalize(NewVernEntry);

function VernDialog(props: {
  vernacularWord: Word;
  open: boolean;
  handleClose: () => void;
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
        <SenseList
          vernacularWord={props.vernacularWord}
          vernListRef={props.vernListRef}
          closeDialog={props.handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
interface SenseListProps {
  vernacularWord: Word;
  vernListRef: React.RefObject<HTMLDivElement>;
  closeDialog: () => void;
}
interface SenseListState {
  selectedIndex: number;
}
class SenseList extends React.Component<SenseListProps, SenseListState> {
  // TODO: Fetch words with duplicate vernaculars (homographs)
  currentWord: ReviewEntriesWord;
  constructor(props: any) {
    super(props);
    this.currentWord = parseWord(props.vernacularWord, "en"); //TODO get analysis lang
  }

  render() {
    return (
      <React.Fragment>
        <h1>Select the desired vernacular</h1>
        <MenuList
          autoFocusItem={true}
          onKeyDown={(e: React.KeyboardEvent<HTMLUListElement>) => {
            if (e.key === "Enter") {
              // TODO Save vern (set new entry)
              this.props.closeDialog();
            }
          }}
        >
          <MenuItem>
            {<h4>{this.props.vernacularWord.vernacular}</h4>}
            <SenseCell
              editable={false}
              sortingByGloss={true}
              value={this.currentWord.senses}
              rowData={this.currentWord}
            />
            <DomainCell rowData={this.currentWord} sortingByDomains={false} />
          </MenuItem>
          <MenuItem>
            {"New Entry for " + this.props.vernacularWord.vernacular}
          </MenuItem>
        </MenuList>
      </React.Fragment>
    );
  }
}
