import React from "react";
import {
  Popper,
  TextField,
  Tooltip,
  Typography,
  Dialog,
  DialogContent,
  List,
  ListItem,
  Grid,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { Word, Sense, simpleWord } from "../../../../../types/word";
import { shade } from "../../../../../types/theme";
import { AutoComplete } from "../../../../../types/AutoComplete";
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
  newEntry: Word;
  showAutocompleteToggle: boolean;
  autocompleteSetting: AutoComplete;
  vernInput: React.RefObject<HTMLDivElement>;
  allWords: Word[];
  toggleAutocompleteView: () => void;
  updateNewEntry: (newEntry: Word) => void;
}
interface NewVernEntryState {
  open: boolean;
  selectedVernacularWord: Word;
}
function VernDialog(props: {
  vernacularWord: Word;
  open: boolean;
  onClose?: () => void;
}) {
  return (
    <Dialog open={props.open}>
      <DialogContent>
        <SenseList vernacularWord={props.vernacularWord} />
      </DialogContent>
    </Dialog>
  );
}
function SenseList(props: { vernacularWord: Word }) {
  // TODO: Fetch words with duplicate vernaculars (homographs)
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const handleListItemClick = (index: number) => {
    setSelectedIndex(index);
  };
  let currentWord: ReviewEntriesWord = parseWord(props.vernacularWord, "en"); //TODO get analysis lang
  if (props.vernacularWord) {
    return (
      <Grid
        onKeyUp={(e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter") {
            // save vern and close
          } else if (e.key === "Tab" || e.key === "ArrowDown") {
            setSelectedIndex((selectedIndex + 1) % 2); //TODO change 2 to the length of the list of items
          } else if (e.key === "ArrowUp") {
            let newIndex = selectedIndex - 1;
            if (newIndex < 0) {
              newIndex = 1; // TODO Set the new index equal to the len(list of items) - 1
            }
            setSelectedIndex(newIndex);
          }
        }}
      >
        <h1>Select the desired vernacular</h1>
        <List>
          <ListItem
            selected={selectedIndex === 0}
            onClick={() => handleListItemClick(0)}
          >
            {<h4>{props.vernacularWord.vernacular}</h4>}
            <SenseCell
              editable={false}
              sortingByGloss={true}
              value={currentWord.senses}
              rowData={currentWord}
            />
            <DomainCell rowData={currentWord} sortingByDomains={false} />
          </ListItem>
          <ListItem
            selected={selectedIndex === 1}
            onClick={() => handleListItemClick(1)}
          >
            {"New Entry for " + props.vernacularWord.vernacular}
          </ListItem>
        </List>
      </Grid>
    );
  }
  return <h1>Vern Words Undefined</h1>;
}
/**
 * An editable vernacular field for new words that indicates whether the
 * vernacular already exists in a collection
 */
export class NewVernEntry extends React.Component<
  LocalizeContextProps & NewVernEntryProps,
  NewVernEntryState
> {
  constructor(props: any) {
    super(props);
    this.state = {
      open: false,
      selectedVernacularWord: simpleWord("", ""),
    };
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
        {this.props.showAutocompleteToggle && (
          <Tooltip
            title={<Translate id="addWords.wordInDatabase" />}
            placement="top"
          >
            <div
              style={{
                height: "5px",
                width: "5px",
                border: "2px solid red",
                borderRadius: "50%",
                position: "absolute",
                top: 24,
                right: 48,
                cursor: "pointer",
              }}
              onClick={() => this.props.toggleAutocompleteView()}
            />
          </Tooltip>
        )}
        <VernDialog
          open={this.state.open}
          onClose={() => console.log("closing")}
          vernacularWord={this.state.selectedVernacularWord}
        />
      </div>
    );
  }
}

export default withLocalize(NewVernEntry);
