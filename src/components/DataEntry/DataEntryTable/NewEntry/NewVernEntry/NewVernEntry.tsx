import React from "react";
import {
  Popper,
  TextField,
  Tooltip,
  Typography,
  Dialog,
  DialogContent,
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
  selectedVernacularWord?: Word;
}
function VernDialog(props: {
  vernacularWord?: Word;
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
function SenseList(props: { vernacularWord?: Word }) {
  // <div>
  //   props.vernacularWords.map((word) => <h1>word.vernacular</h1>);
  // </div>
  if (props.vernacularWord) {
    return (
      <React.Fragment>
        <h1>{props.vernacularWord.vernacular}</h1>
        {props.vernacularWord.senses.map((sense) => {
          sense.glosses.map((gloss) => gloss.def);
        })}
        {props.vernacularWord.senses[0].glosses.map((gloss) => gloss.def)}
        {" | "}
        {props.vernacularWord.senses[0].semanticDomains.map((domain) => (
          <React.Fragment>
            <Typography style={{ background: shade, borderRadius: "15px" }}>
              {domain.id}: {domain.name}
            </Typography>
          </React.Fragment>
        ))}
      </React.Fragment>
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
