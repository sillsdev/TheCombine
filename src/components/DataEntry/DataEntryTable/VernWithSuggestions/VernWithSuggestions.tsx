import {
  Dialog,
  DialogContent,
  MenuItem,
  MenuList,
  TextField,
  withStyles,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize,
} from "react-localize-redux";

import theme from "../../../../types/theme";
import { Word } from "../../../../types/word";
import DupFinder from "../../../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";
import SenseCell from "../../../../goals/ReviewEntries/ReviewEntriesComponent/CellComponents/SenseCell";
import DomainCell from "../../../../goals/ReviewEntries/ReviewEntriesComponent/CellComponents/DomainCell";
import { parseWord } from "../../../../goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";

interface VernWithSuggestionsProps {
  isNew?: boolean;
  vernacular: string;
  vernInput?: React.RefObject<HTMLDivElement>;
  updateVernField: (newValue: string) => Word[];
  allVerns: string[];
  handleEnter: (e: React.KeyboardEvent) => void;
  updateWordId: (wordId?: string) => void;
  onBlur?: () => void;
}
interface VernWithSuggestionsState {
  open: boolean;
  suggestedVerns: string[];
  dupVernWords: Word[];
  selectedVernacular?: string;
}

/**
 * An editable vernacular field for new words
 */
export class VernWithSuggestions extends React.Component<
  LocalizeContextProps & VernWithSuggestionsProps,
  VernWithSuggestionsState
> {
  readonly maxSuggestions = 5;
  vernListRef: React.RefObject<HTMLDivElement>;
  suggestionFinder: DupFinder = new DupFinder();

  constructor(props: any) {
    super(props);
    this.state = {
      open: false,
      suggestedVerns: [],
      dupVernWords: [],
    };
    this.vernListRef = React.createRef();
  }

  updateSuggestedVerns(value?: string | null) {
    let suggestedVerns: string[] = [];
    if (value) {
      const sortedVerns: string[] = this.props.allVerns.sort(
        (a: string, b: string) =>
          this.suggestionFinder.getLevenshteinDistance(a, value) -
          this.suggestionFinder.getLevenshteinDistance(b, value)
      );
      suggestedVerns = sortedVerns.slice(0, this.maxSuggestions);
    }
    this.setState({ suggestedVerns });
  }

  selectWord(word: Word) {
    this.props.updateWordId(word.id);
    this.setState({ selectedVernacular: word.vernacular });
  }

  clearSelectedWord() {
    this.props.updateWordId();
    this.setState({ selectedVernacular: undefined });
  }

  render() {
    return (
      <div>
        <Autocomplete
          freeSolo
          id="newvernentry"
          value={this.props.vernacular}
          options={this.state.suggestedVerns}
          onBlur={(_event: React.FocusEvent<HTMLDivElement>) => {
            let dupVernWords: Word[] = this.props.updateVernField(
              this.props.vernacular
            );
            if (dupVernWords.length > 0) {
              this.setState({ open: true, dupVernWords });
            } else {
              this.clearSelectedWord();
            }
            if (this.props.onBlur) {
              this.props.onBlur();
            }
          }}
          onChange={(_event, value) => {
            let dupVernWords: Word[] = [];
            let open: boolean = false;
            if (!value) {
              this.clearSelectedWord();
              this.props.updateVernField("");
            } else {
              dupVernWords = this.props.updateVernField(value!);
              open = dupVernWords.length > 0;
              if (!open) {
                this.clearSelectedWord();
              }
            }
            this.setState({ dupVernWords, open });
            this.updateSuggestedVerns(value);
          }}
          onInputChange={(_event, value) => {
            console.log("Input Changed: " + value);
            this.props.updateVernField(value);
            this.updateSuggestedVerns(value);
            if (value !== this.state.selectedVernacular) {
              this.clearSelectedWord();
            }
          }}
          onKeyDown={(e) => this.props.handleEnter(e)}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              inputRef={this.props.vernInput}
              label={
                this.props.isNew ? <Translate id="addWords.vernacular" /> : ""
              }
              variant={this.props.isNew ? "outlined" : "standard"}
            />
          )}
        />
        <VernDialog
          open={this.state.open}
          handleClose={(selectedWord?: Word) => {
            this.setState({ open: false });
            if (selectedWord) {
              this.selectWord(selectedWord);
            } else {
              this.clearSelectedWord();
            }
          }}
          vernacularWords={this.state.dupVernWords}
          vernListRef={this.vernListRef}
        />
      </div>
    );
  }
}

export default withLocalize(VernWithSuggestions);

function VernDialog(props: {
  vernacularWords: Word[];
  open: boolean;
  handleClose: (selectedWord?: Word) => void;
  vernListRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <Dialog
      open={props.open}
      onClose={() => props.handleClose()}
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
  closeDialog: (selectedWord: Word) => void;
}
interface VernListState {
  selectedIndex: number;
}

// Copied from customized menus at https://material-ui.com/components/menus/
const StyledMenuItem = withStyles((theme) => ({
  root: {
    "&:focus": {
      backgroundColor: theme.palette.primary.main,
      "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
        color: theme.palette.common.white,
      },
    },
  },
}))(MenuItem);

class VernList extends React.Component<VernListProps, VernListState> {
  render() {
    return (
      <React.Fragment>
        <h1>Select the desired vernacular</h1>
        <MenuList autoFocusItem>
          {this.props.vernacularWords.map((word: Word) => (
            <StyledMenuItem
              onClick={() => this.props.closeDialog(word)}
              key={word.id}
            >
              {<h4 style={{ margin: theme.spacing(2) }}>{word.vernacular}</h4>}
              <div style={{ margin: theme.spacing(4) }}>
                <SenseCell
                  editable={false}
                  sortingByGloss={false}
                  value={parseWord(word, "en").senses}
                  rowData={parseWord(word, "en")}
                />
              </div>
              <div style={{ margin: theme.spacing(4) }}>
                <DomainCell
                  rowData={parseWord(word, "en")}
                  sortingByDomains={false}
                />
              </div>
            </StyledMenuItem>
          ))}

          <StyledMenuItem
            onClick={() =>
              this.props.closeDialog({
                vernacular: this.props.vernacularWords[0].vernacular,
                id: "",
              } as Word)
            }
          >
            {"New Entry for " + this.props.vernacularWords[0].vernacular}
          </StyledMenuItem>
        </MenuList>
      </React.Fragment>
    );
  }
}
