import React from "react";
import MaterialTable from "material-table";
import {
  Translate,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";
import { Button, Paper, TextField, Chip } from "@material-ui/core";

import { Word, SemanticDomain, Sense, State } from "../../../types/word";
import tableIcons from "./icons";
import * as backend from "../../../backend";
import DomainCell from "./CellComponents";
import { Add } from "@material-ui/icons";
import AlignedList from "./CellComponents/AlignedList";
import DeleteCell from "./CellComponents/DeleteCell";
import { uuid } from "../../../utilities";

// Component state/props
interface ViewFinalProps {
  // Props mapped to store
  language: string;
  words: ViewFinalWord[];
  edits: string[];

  // Dispatch changes
  updateVernacular: (id: string, newVernacular: string) => void;
  updateGlosses: (id: string, editId: string, newGlosses: string) => void;
  addDomain: (id: string, senseId: string, newDomain: SemanticDomain) => void;
  deleteDomain: (
    id: string,
    senseId: string,
    delDomain: SemanticDomain
  ) => void;
  addSense: (id: string) => void;
  deleteSense: (id: string, deleteId: string) => void;
  updateWords: (words: ViewFinalWord[]) => void;
  updateWord: (id: string, newId: string, newWord?: ViewFinalWord) => void;
  resetEdits: () => void;
}

interface ViewFinalState {
  editingField: boolean;
}

export interface ViewFinalWord {
  id: string;
  vernacular: string;
  senses: ViewFinalSense[];
}
export interface ViewFinalSense {
  senseId: string;
  glosses: string;
  domains: SemanticDomain[];
  deleted: boolean;
}

interface FieldParameterStandard {
  rowData: ViewFinalWord;
  value: any;
  onRowDataChange?: (...args: any) => any;
}

// Constants
export const OLD_SENSE: string = "-old";

const SEP_CHAR: string = ",";
const SEPARATOR: string = SEP_CHAR + " ";
const NO_GLOSS: string = "{No gloss}";

export class ViewFinalComponent extends React.Component<
  ViewFinalProps & LocalizeContextProps,
  ViewFinalState
> {
  readonly COLUMNS = [
    {
      title: "Vernacular",
      field: "vernacular",
      render: (rowData: ViewFinalWord) =>
        this.vernacularField({ rowData, value: rowData.vernacular }, false),
      editComponent: (props: any) => this.vernacularField(props, true)
    },
    {
      title: "Glosses",
      field: "senses",
      disableClick: true,
      render: (rowData: ViewFinalWord) =>
        this.senseField({ rowData, value: rowData.senses }, false),
      editComponent: (props: any) => this.senseField(props, true),
      customFilterAndSearch: (
        term: string,
        rowData: ViewFinalWord
      ): boolean => {
        let regex: RegExp = new RegExp(term);
        for (let sense of rowData.senses)
          if (regex.exec(sense.glosses) !== null) return true;
        return false;
      },
      customSort: (a: any, b: any, type: "row" | "group"): number => {
        let count = 0;
        let compare: number = 0;
        while (
          count < a.senses.length &&
          count < b.senses.length &&
          compare === 0
        ) {
          for (
            let i = 0;
            i < a.senses[count].glosses.length &&
            i < b.senses[count].glosses.length &&
            compare === 0;
            i++
          )
            compare =
              a.senses[count].glosses.codePointAt(i) -
              b.senses[count].glosses.codePointAt(i);
          count++;
        }
        return compare;
      }
    },
    {
      title: "Domains",
      field: "domains",
      render: (rowData: ViewFinalWord) => (
        <DomainCell
          rowData={rowData}
          editable={false}
          addDomain={this.props.addDomain}
          deleteDomain={this.props.deleteDomain}
        />
      ),
      editComponent: (props: any) => (
        <DomainCell
          rowData={props.rowData}
          editable={true}
          addDomain={this.props.addDomain}
          deleteDomain={this.props.deleteDomain}
        />
      ),
      customFilterAndSearch: (
        term: string,
        rowData: ViewFinalWord
      ): boolean => {
        let regex: RegExp = new RegExp(term);
        for (let sense of rowData.senses)
          for (let domain of sense.domains)
            if (
              regex.exec(domain.name) !== null ||
              regex.exec(domain.id) !== null
            )
              return true;
        return false;
      },
      customSort: (a: any, b: any, type: "row" | "group"): number => {
        let count = 0;
        let compare: number = 0;
        debugger;
        while (
          count < a.senses.length &&
          count < b.senses.length &&
          compare === 0
        ) {
          for (
            let i = 0;
            i < a.senses[count].domains.length &&
            i < b.senses[count].domains.length &&
            compare === 0;
            i++
          ) {
            compare =
              a.senses[count].domains[i].id.codePointAt(i) -
              b.senses[count].domains[i].id.codePointAt(i);
          }
          count++;
        }
        return compare;
      }
    },
    {
      title: "",
      field: "id",
      render: (rowData: ViewFinalWord) => null,
      editComponent: (props: any) => (
        <DeleteCell rowData={props.rowData} delete={this.props.deleteSense} />
      )
    }
  ];

  constructor(props: ViewFinalProps & LocalizeContextProps) {
    super(props);

    // TODO: Make this default to the current user's language
    this.senseField = this.senseField.bind(this);
    this.vernacularField = this.vernacularField.bind(this);
    this.updateFrontierWords = this.updateFrontierWords.bind(this);

    this.state = {
      editingField: false
    };
  }

  async componentDidMount() {
    backend
      .getFrontierWords()
      .then((frontier: Word[]) => this.updateLocalWords(frontier));
  }

  // Creates the local set of words from the frontier
  private updateLocalWords(frontier: Word[]) {
    let hasGloss: boolean;
    let newWords: ViewFinalWord[] = [];
    let currentWord: ViewFinalWord;
    let currentSense: ViewFinalSense;

    for (let word of frontier) {
      // Bypass deleted words
      if (word.accessability === State.deleted) continue;

      // Create a new currentword
      currentWord = {
        id: word.id,
        vernacular: word.vernacular,
        senses: []
      };

      for (let sense of word.senses) {
        // Bypass deleted senses
        if (sense.accessibility === State.deleted) continue;

        currentSense = {
          glosses: "",
          domains: [...sense.semanticDomains],
          deleted: false,
          senseId: uuid() + OLD_SENSE
        };

        // Find all glosses in the current language
        hasGloss = false;
        for (let gloss of sense.glosses)
          if (gloss.language === this.props.language) {
            hasGloss = true;
            currentSense.glosses += gloss.def + SEPARATOR;
          }

        // Format the glosses + push them
        if (hasGloss)
          currentSense.glosses = currentSense.glosses.slice(
            0,
            -SEPARATOR.length
          );
        else currentSense.glosses = NO_GLOSS;
        currentWord.senses.push(currentSense);
      }

      // Remove the trailing newlines + push to newWords
      newWords.push(currentWord);
    }
    this.props.updateWords(newWords);
  }

  // Updates the frontier from the local word set
  private async updateFrontierWords() {
    let editWord: Word;
    let editSource: ViewFinalWord;
    let edits: string[] = Array.from(new Set(this.props.edits));

    let editSense: Sense | undefined;
    let originalIndex: number;

    for (let edit of edits) {
      editWord = await backend.getWord(edit);
      editSource = this.props.words.find(
        value => value.id === edit
      ) as ViewFinalWord;

      originalIndex = 0;
      editWord.vernacular = editSource.vernacular;
      editWord.senses = editSource.senses.map(newSense => {
        if (originalIndex < editWord.senses.length) {
          editSense = editWord.senses[originalIndex];
          originalIndex++;
        } else editSense = undefined;

        if (!newSense.deleted) {
          // Create a new sense if a sense doesn't exist
          if (!editSense)
            editSense = ({
              glosses: [],
              accessibility: State.active
            } as any) as Sense;

          // Take all glosses from what the user edited, then add all glosses from the original word which are not in the current language
          return {
            ...editSense,
            glosses: [
              ...newSense.glosses.split(SEP_CHAR).map(gloss => {
                return {
                  language: this.props.language,
                  def: gloss.trim()
                };
              }),
              ...editSense.glosses.filter(
                gloss => gloss.language !== this.props.language
              )
            ],
            semanticDomains: newSense.domains
          };
        } else
          return ({
            ...editSense,
            accessibility: State.deleted
          } as any) as Sense;
      });

      debugger;
      this.props.updateWord(edit, (await backend.updateWord(editWord)).id);
    }
    this.props.resetEdits();
  }

  // Create the vernacular text field
  // private vernacularDisplay(rowData: ViewFinalWord) {
  //   return (
  //     <TextField
  //       key={`vernacular${rowData.id}`}
  //       value={rowData.vernacular}
  //       disabled={true}
  //     />
  //   );
  // }
  private vernacularField(props: FieldParameterStandard, editable: boolean) {
    return (
      <TextField
        {...props}
        key={`vernacular${props.rowData.id}`}
        value={props.value}
        disabled={!editable}
        // onRowDataChange={() => props.setState({ data: props.rowData })}
        onChange={event =>
          props.onRowDataChange &&
          props.onRowDataChange({
            ...props.rowData,
            vernacular: event.target.value
          })
        }
      />
    );
  }

  // Create the sense edit fields
  private senseField(props: FieldParameterStandard, editable: boolean) {
    return (
      <AlignedList
        contents={props.rowData.senses.map(
          (sense: ViewFinalSense, index: number) => (
            <TextField
              key={props.rowData.id}
              value={props.value[index].glosses}
              disabled={!editable}
              onChange={event =>
                props.onRowDataChange &&
                props.onRowDataChange({
                  ...props.rowData,
                  senses: [
                    ...props.rowData.senses.slice(0, index),
                    { ...sense, glosses: event.target.value },
                    ...props.rowData.senses.slice(
                      index + 1,
                      props.rowData.senses.length
                    )
                  ]
                })
              }
            />
          )
        )}
        bottomCell={
          editable ? (
            <Chip
              label={<Add />}
              onClick={() => this.props.addSense(props.rowData.id)}
            />
          ) : null
        }
      />
    );
  }

  render() {
    return (
      <Paper>
        <MaterialTable
          icons={tableIcons}
          title={<Translate id={"viewFinal.title"} />}
          columns={this.COLUMNS}
          data={this.props.words.map(word => {
            return {
              ...word,
              senses: word.senses.filter(sense => !sense.deleted)
            };
          })}
          editable={{
            onRowUpdate: (newData, oldData) =>
              new Promise(resolve =>
                setTimeout(() => {
                  this.props.updateWord(oldData.id, newData.id, newData);
                  this.forceUpdate();
                  resolve();
                }, 500)
              )
          }}
        />
        <Button onClick={this.updateFrontierWords}>
          <Translate id="viewFinal.submit" />
        </Button>
      </Paper>
    );
  }
}

export default withLocalize(ViewFinalComponent);
