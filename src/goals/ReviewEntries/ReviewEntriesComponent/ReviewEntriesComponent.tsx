import { Typography } from "@material-ui/core";
import MaterialTable from "material-table";
import React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize,
} from "react-localize-redux";

import { getFrontierWords } from "../../../backend";
import Recorder from "../../../components/Pronunciations/Recorder";
import theme from "../../../types/theme";
import { Word } from "../../../types/word";
import columns from "./CellComponents/CellColumns";
import tableIcons from "./icons";
import { parseWord, ReviewEntriesWord } from "./ReviewEntriesTypes";

// Component state/props
interface ReviewEntriesProps {
  // Props mapped to store
  language: string;
  words: ReviewEntriesWord[];

  // Dispatch changes
  updateAllWords: (words: ReviewEntriesWord[]) => void;
  updateFrontierWord: (
    newData: ReviewEntriesWord,
    oldData: ReviewEntriesWord,
    language: string
  ) => Promise<void>;
}

interface ReviewEntriesState {
  editingField: boolean;
  errorMsg: string | undefined;
}

// Constants
const ROWS_PER_PAGE: number[] = [10, 100, 1000];

export class ReviewEntriesComponent extends React.Component<
  ReviewEntriesProps & LocalizeContextProps,
  ReviewEntriesState
> {
  recorder: Recorder;

  constructor(props: ReviewEntriesProps & LocalizeContextProps) {
    super(props);

    this.state = {
      editingField: false,
      errorMsg: undefined,
    };
    this.recorder = new Recorder();
  }

  componentDidMount() {
    getFrontierWords().then((frontier: Word[]) =>
      this.updateLocalWords(frontier)
    );
  }

  // Creates the local set of words from the frontier
  private updateLocalWords(frontier: Word[]) {
    let newWords: ReviewEntriesWord[] = [];
    let currentWord: ReviewEntriesWord;

    for (let word of frontier) {
      // Create a new currentword
      currentWord = parseWord(word, this.props.language, this.recorder);

      // Remove the trailing newlines + push to newWords
      newWords.push(currentWord);
    }
    this.props.updateAllWords(newWords);
  }

  // Remove the duplicates from an array; sugar syntax, as the place it's used is already hideous enough without adding more
  private removeDuplicates(array: any[]) {
    return [...new Set(array)];
  }

  render() {
    return (
      <Translate>
        {({ translate }) => (
          <Typography
            component="h1"
            variant="h4"
            style={{ marginTop: theme.spacing(1) }}
          >
            <MaterialTable<any>
              icons={tableIcons}
              title={<Translate id={"reviewEntries.title"} />}
              columns={columns}
              data={this.props.words.map((word) =>
                word === null
                  ? null
                  : {
                      ...word,
                      senses: word.senses.filter((sense) => !sense.deleted),
                    }
              )}
              editable={{
                onRowUpdate: (
                  newData: ReviewEntriesWord,
                  oldData: ReviewEntriesWord
                ) =>
                  new Promise(async (resolve, reject) => {
                    // Update database + update word ID. Awaited so that the user can't edit + submit a word with a bad ID before the ID is updated
                    this.props
                      .updateFrontierWord(newData, oldData, this.props.language)
                      .then(() => {
                        setTimeout(() => {
                          resolve();
                        }, 500);
                      })
                      .catch((reason) => {
                        // May wish to change this alert method
                        alert(translate(reason));
                        reject();
                      });
                  }),
              }}
              options={{
                filtering: true,
                pageSize:
                  this.props.words.length > 0
                    ? Math.min(this.props.words.length, ROWS_PER_PAGE[0])
                    : ROWS_PER_PAGE[0],
                pageSizeOptions: this.removeDuplicates([
                  Math.min(this.props.words.length, ROWS_PER_PAGE[0]),
                  Math.min(this.props.words.length, ROWS_PER_PAGE[1]),
                  Math.min(this.props.words.length, ROWS_PER_PAGE[2]),
                ]),
              }}
            />
          </Typography>
        )}
      </Translate>
    );
  }
}

export default withLocalize(ReviewEntriesComponent);
