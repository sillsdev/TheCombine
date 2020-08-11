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
  duplicateVerns: Word[];
  selectedVernacular: Word;
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
      duplicateVerns: [],
      selectedVernacular: simpleWord("", ""), //TODO verify that this is not used to create a new word
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
                duplicateVerns: [simpleWord("", "")],
              });
            } else if (typeof value === "string") {
              console.log("STRING SELECTION");
              this.setState({
                open: true,
                duplicateVerns: [simpleWord("", "")],
              });
            } else {
              this.setState({ duplicateVerns: [] });
              let newDuplicateVerns: Word[] = [];
              this.props.allWords.forEach((word) => {
                if (value.vernacular === word.vernacular) {
                  newDuplicateVerns.push(word);
                }
              });
              this.setState({ open: true, duplicateVerns: newDuplicateVerns });
            }
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
