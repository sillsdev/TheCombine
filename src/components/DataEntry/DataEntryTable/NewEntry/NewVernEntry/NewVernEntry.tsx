import React from "react";
import {
  TextField,
  Dialog,
  DialogContent,
  MenuList,
  MenuItem,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { Word } from "../../../../../types/word";
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
  allWords: Word[];
  updateWordId: (wordId: string) => void;
}
interface NewVernEntryState {
  open: boolean;
  selectedWord?: Word;
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
    };
    this.vernListRef = React.createRef();
  }

  render() {
    return (
      <div>
        <Autocomplete
          freeSolo
          id="newvernentry"
          value={this.props.vernacular}
          options={this.props.allWords}
          getOptionLabel={(option) => (option ? option.vernacular : "")}
          renderOption={(option) => (option ? option.vernacular : "")}
          renderInput={(params) => (
            <TextField
              {...params}
              label={<Translate id="addWords.vernacular" />}
              variant="outlined"
              fullWidth
            />
          )}
          onChange={(_event, value) => {
            if (!value) {
              this.props.updateVernField("");
              this.setState({ open: false, selectedWord: undefined });
            } else if (typeof value === "string") {
              this.props.updateVernField(value);
            } else {
              this.props.updateVernField(value.vernacular);
              this.setState({ open: true, selectedWord: value });
            }
          }}
          onInputChange={(_event, value) => {
            this.props.updateVernField(value);
          }}
        />
        <VernDialog
          open={this.state.open}
          handleClose={() => this.setState({ open: false })}
          vernacular={this.props.vernacular}
          vernListRef={this.vernListRef}
        />
      </div>
    );
  }
}

export default withLocalize(NewVernEntry);

function VernDialog(props: {
  vernacular: string;
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
          vernacular={props.vernacular}
          vernListRef={props.vernListRef}
          closeDialog={props.handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}

interface SenseListProps {
  vernacular: string;
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
            {<h4>{this.props.vernacular}</h4>}
            <SenseCell
              editable={false}
              sortingByGloss={true}
              value={this.currentWord.senses}
              rowData={this.currentWord}
            />
            <DomainCell rowData={this.currentWord} sortingByDomains={false} />
          </MenuItem>
          <MenuItem>{"New Entry for " + this.props.vernacular}</MenuItem>
        </MenuList>
      </React.Fragment>
    );
  }
}
