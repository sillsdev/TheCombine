import { Column } from "@material-table/core";
import { Input, Typography } from "@mui/material";
import { t } from "i18next";

import { SemanticDomain } from "api/models";
import {
  DefinitionCell,
  DeleteCell,
  DomainCell,
  FlagCell,
  GlossCell,
  HistoryCell,
  NoteCell,
  PartOfSpeechCell,
  PronunciationsCell,
  SenseCell,
  VernacularCell,
} from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents";
import {
  ReviewEntriesSense,
  ReviewEntriesWord,
  ReviewEntriesWordField,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { compareFlags } from "utilities/wordUtilities";

enum SortStyle {
  Vernacular,
  Sense,
  Definition,
  Gloss,
  PartOfSpeech,
  Domain,
  Pronunciation,
  Note,
  Flag,
  History,
  None,
}

export class ColumnTitle {
  static Vernacular = t("reviewEntries.columns.vernacular");
  static Senses = t("reviewEntries.columns.senses");
  static Definitions = t("reviewEntries.columns.definitions");
  static Glosses = t("reviewEntries.columns.glosses");
  static PartOfSpeech = t("reviewEntries.columns.partOfSpeech");
  static Domains = t("reviewEntries.columns.domains");
  static Pronunciations = t("reviewEntries.columns.pronunciations");
  static Note = t("reviewEntries.columns.note");
  static Flag = t("reviewEntries.columns.flag");
  static History = t("reviewEntries.columns.history");
  static Delete = t("reviewEntries.columns.delete");
}

function domainNumberToArray(id: string): number[] {
  return id.split(".").map((digit) => parseInt(digit, 10));
}

function cleanRegExp(input: string): RegExp {
  const cleaned = input.trim().toLowerCase();
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
  const escaped = cleaned.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(escaped);
}

export interface FieldParameterStandard {
  rowData: ReviewEntriesWord;
  value: any;
  onRowDataChange?: (word: ReviewEntriesWord) => any;
}

let currentSort: SortStyle = SortStyle.None;
const columns: Column<any>[] = [
  // Vernacular column
  {
    title: ColumnTitle.Vernacular,
    // field determines what is passed as props.value to editComponent
    field: ReviewEntriesWordField.Vernacular,
    render: (rowData: ReviewEntriesWord) => (
      <VernacularCell rowData={rowData} value={rowData.vernacular} />
    ),
    editComponent: (props: FieldParameterStandard) => (
      <VernacularCell {...props} editable />
    ),
    customSort: (a: ReviewEntriesWord, b: ReviewEntriesWord): number => {
      if (currentSort !== SortStyle.Vernacular) {
        currentSort = SortStyle.Vernacular;
      }
      return a.vernacular.localeCompare(b.vernacular);
    },
  },

  // Senses column
  {
    title: ColumnTitle.Senses,
    // field determines what is passed as props.value to editComponent
    field: ReviewEntriesWordField.Senses,
    // Fix column to minimum width.
    width: 0,
    render: (rowData: ReviewEntriesWord) => (
      <Typography>{rowData.senses.length}</Typography>
    ),
    filterPlaceholder: "#",
    customFilterAndSearch: (
      filter: string,
      rowData: ReviewEntriesWord
    ): boolean => {
      return parseInt(filter) === rowData.senses.length;
    },
    customSort: (a: ReviewEntriesWord, b: ReviewEntriesWord): number => {
      if (currentSort !== SortStyle.Sense) {
        currentSort = SortStyle.Sense;
      }
      return b.senses.length - a.senses.length;
    },
    editComponent: (props: FieldParameterStandard) => {
      const deleteSense = (guid: string): void => {
        if (props.onRowDataChange) {
          props.onRowDataChange({
            ...props.rowData,
            senses: props.rowData.senses.map((s) =>
              s.guid === guid ? { ...s, deleted: !s.deleted } : s
            ),
          });
        }
      };
      return <SenseCell {...props} delete={deleteSense} />;
    },
  },

  // Definitions column
  {
    title: ColumnTitle.Definitions,
    // field determines what is passed as props.value to editComponent
    field: ReviewEntriesWordField.Senses,
    disableClick: true,
    render: (rowData: ReviewEntriesWord) => (
      <DefinitionCell
        value={rowData.senses}
        rowData={rowData}
        sortingByThis={currentSort === SortStyle.Definition}
      />
    ),
    editComponent: (props: FieldParameterStandard) => (
      <DefinitionCell {...props} editable />
    ),
    customFilterAndSearch: (
      term: string,
      rowData: ReviewEntriesWord
    ): boolean => {
      const regex = cleanRegExp(term);
      for (const sense of rowData.senses) {
        const definitionsString = ReviewEntriesSense.definitionString(sense);
        if (regex.exec(definitionsString.toLowerCase())) {
          return true;
        }
      }
      return false;
    },
    customSort: (a: ReviewEntriesWord, b: ReviewEntriesWord): number => {
      if (currentSort !== SortStyle.Definition) {
        currentSort = SortStyle.Definition;
      }

      for (
        let count = 0;
        count < a.senses.length && count < b.senses.length;
        count++
      ) {
        const stringA = ReviewEntriesSense.definitionString(a.senses[count]);
        const stringB = ReviewEntriesSense.definitionString(b.senses[count]);
        if (stringA !== stringB) {
          return stringA.localeCompare(stringB);
        }
      }
      return a.senses.length - b.senses.length;
    },
  },

  // Glosses column
  {
    title: ColumnTitle.Glosses,
    // field determines what is passed as props.value to editComponent
    field: ReviewEntriesWordField.Senses,
    disableClick: true,
    render: (rowData: ReviewEntriesWord) => (
      <GlossCell
        value={rowData.senses}
        rowData={rowData}
        sortingByThis={currentSort === SortStyle.Gloss}
      />
    ),
    editComponent: (props: FieldParameterStandard) => (
      <GlossCell {...props} editable />
    ),
    customFilterAndSearch: (
      term: string,
      rowData: ReviewEntriesWord
    ): boolean => {
      const regex = cleanRegExp(term);
      for (const sense of rowData.senses) {
        const glossesString = ReviewEntriesSense.glossString(sense);
        if (regex.exec(glossesString.toLowerCase())) {
          return true;
        }
      }
      return false;
    },
    customSort: (a: ReviewEntriesWord, b: ReviewEntriesWord): number => {
      if (currentSort !== SortStyle.Gloss) {
        currentSort = SortStyle.Gloss;
      }

      for (
        let count = 0;
        count < a.senses.length && count < b.senses.length;
        count++
      ) {
        const stringA = ReviewEntriesSense.glossString(a.senses[count]);
        const stringB = ReviewEntriesSense.glossString(b.senses[count]);
        if (stringA !== stringB) {
          return stringA.localeCompare(stringB);
        }
      }
      return a.senses.length - b.senses.length;
    },
  },

  // Part of Speech column
  {
    title: ColumnTitle.PartOfSpeech,
    disableClick: true,
    editable: "never",
    field: ReviewEntriesWordField.Senses,
    render: (rowData: ReviewEntriesWord) => (
      <PartOfSpeechCell rowData={rowData} />
    ),
    customFilterAndSearch: (
      term: string,
      rowData: ReviewEntriesWord
    ): boolean => {
      const regex = cleanRegExp(term);
      for (const sense of rowData.senses) {
        const gramInfo = `${sense.partOfSpeech.catGroup} ${sense.partOfSpeech.grammaticalCategory}`;
        if (regex.exec(gramInfo.toLowerCase())) {
          return true;
        }
      }
      return false;
    },
    customSort: (a: ReviewEntriesWord, b: ReviewEntriesWord): number => {
      if (currentSort !== SortStyle.PartOfSpeech) {
        currentSort = SortStyle.PartOfSpeech;
      }

      for (
        let count = 0;
        count < a.senses.length && count < b.senses.length;
        count++
      ) {
        const gramInfoA = a.senses[count].partOfSpeech;
        const gramInfoB = b.senses[count].partOfSpeech;
        if (gramInfoA.catGroup === gramInfoB.catGroup) {
          return gramInfoA.grammaticalCategory.localeCompare(
            gramInfoB.grammaticalCategory
          );
        }
        return gramInfoA.catGroup.localeCompare(gramInfoB.catGroup);
      }
      return a.senses.length - b.senses.length;
    },
  },

  // Semantic Domains column
  {
    title: ColumnTitle.Domains,
    // field determines what is passed as props.value to editComponent
    field: ReviewEntriesWordField.Senses,
    render: (rowData: ReviewEntriesWord) => (
      <DomainCell
        rowData={rowData}
        sortingByThis={currentSort === SortStyle.Domain}
      />
    ),
    editComponent: (props: FieldParameterStandard) => {
      const editDomains = (guid: string, domains: SemanticDomain[]): void => {
        if (props.onRowDataChange) {
          props.onRowDataChange({
            ...props.rowData,
            senses: props.rowData.senses.map((s) =>
              s.guid === guid ? { ...s, domains } : s
            ),
          });
        }
      };
      return <DomainCell rowData={props.rowData} editDomains={editDomains} />;
    },
    customFilterAndSearch: (
      term: string,
      rowData: ReviewEntriesWord
    ): boolean => {
      /*
       * Search term expected in one of two formats:
       * 1. id (e.g., "2.1") XOR name (e.g., "bod")
       * 2. id AND name, colon-separated (e.g., "2.1:ody")
       *   All the above examples would find entries with "2.1: Body"
       * IGNORED: capitalization; whitespace around terms; 3+ terms
       *   e.g. " 2.1:BODY:zx:c  " and "2.1  : Body " are equivalent
       */
      const terms = term.split(":");
      if (terms.length === 1) {
        const regex = cleanRegExp(terms[0]);
        for (const sense of rowData.senses) {
          for (const domain of sense.domains) {
            if (
              regex.exec(domain.id)?.index === 0 ||
              regex.exec(domain.name.toLowerCase())
            ) {
              return true;
            }
          }
        }
      } else {
        const regexNumber = cleanRegExp(terms[0]);
        const regexName = cleanRegExp(terms[1]);
        for (const sense of rowData.senses) {
          for (const domain of sense.domains) {
            if (
              regexNumber.exec(domain.id)?.index === 0 &&
              regexName.exec(domain.name.toLowerCase())
            ) {
              return true;
            }
          }
        }
      }
      return false;
    },
    customSort: (a: ReviewEntriesWord, b: ReviewEntriesWord): number => {
      if (currentSort !== SortStyle.Domain) {
        currentSort = SortStyle.Domain;
      }

      let count = 0;
      let compare = 0;

      let domainsA: SemanticDomain[];
      let domainsB: SemanticDomain[];

      let codeA: number[];
      let codeB: number[];

      // Special case: no senses
      if (!a.senses.length || !b.senses.length) {
        return b.senses.length - a.senses.length;
      }

      while (
        compare === 0 &&
        count < a.senses.length &&
        count < b.senses.length
      ) {
        domainsA = a.senses[count].domains;
        domainsB = b.senses[count].domains;

        // If exactly one has no domains, it is the lower rank
        if (!domainsA.length && domainsB.length) {
          return 1;
        }
        if (domainsA.length && !domainsB.length) {
          return -1;
        }

        // Check the domains
        for (
          let d = 0;
          compare === 0 && d < domainsA.length && d < domainsB.length;
          d++
        ) {
          codeA = domainNumberToArray(domainsA[d].id);
          codeB = domainNumberToArray(domainsB[d].id);
          for (
            let i = 0;
            i < codeA.length && i < codeB.length && compare === 0;
            i++
          ) {
            compare = codeA[i] - codeB[i];
          }

          // If the two glosses SEEM identical, sort by length
          if (compare === 0) {
            compare = codeA.length - codeB.length;
          }
        }
        count++;
      }

      return compare;
    },
  },

  // Audio column
  {
    title: ColumnTitle.Pronunciations,
    // field determines what is passed as props.value to editComponent
    field: ReviewEntriesWordField.Pronunciations,
    filterPlaceholder: "#",
    render: (rowData: ReviewEntriesWord) => (
      <PronunciationsCell
        pronunciationFiles={rowData.audio}
        wordId={rowData.id}
      />
    ),
    editComponent: (props: FieldParameterStandard) => (
      <PronunciationsCell
        audioFunctions={{
          addNewAudio: (file: File): void => {
            props.onRowDataChange &&
              props.onRowDataChange({
                ...props.rowData,
                audioNew: [
                  ...(props.rowData.audioNew ?? []),
                  URL.createObjectURL(file),
                ],
              });
          },
          delNewAudio: (url: string): void => {
            props.onRowDataChange &&
              props.onRowDataChange({
                ...props.rowData,
                audioNew: props.rowData.audioNew?.filter((u) => u !== url),
              });
          },
          delOldAudio: (fileName: string): void => {
            props.onRowDataChange &&
              props.onRowDataChange({
                ...props.rowData,
                audio: props.rowData.audio.filter((f) => f !== fileName),
              });
          },
        }}
        pronunciationFiles={props.rowData.audio}
        pronunciationsNew={props.rowData.audioNew}
        wordId={props.rowData.id}
      />
    ),
    customFilterAndSearch: (
      filter: string,
      rowData: ReviewEntriesWord
    ): boolean => {
      return parseInt(filter) === rowData.audio.length;
    },
    customSort: (a: ReviewEntriesWord, b: ReviewEntriesWord): number => {
      if (currentSort !== SortStyle.Pronunciation) {
        currentSort = SortStyle.Pronunciation;
      }
      return b.audio.length - a.audio.length;
    },
  },

  // Note column
  {
    title: ColumnTitle.Note,
    // field determines what is passed as props.value to editComponent
    field: ReviewEntriesWordField.Note,
    render: (rowData: ReviewEntriesWord) => (
      <Input
        fullWidth
        key={`note${rowData.id}`}
        value={rowData.noteText}
        readOnly
        disableUnderline
        multiline
      />
    ),
    editComponent: (props: FieldParameterStandard) => <NoteCell {...props} />,
    customSort: (a: ReviewEntriesWord, b: ReviewEntriesWord): number => {
      if (currentSort !== SortStyle.Note) {
        currentSort = SortStyle.Note;
      }
      return a.noteText.localeCompare(b.noteText);
    },
  },

  // Flag column
  {
    title: ColumnTitle.Flag,
    // field determines what is passed as props.value to editComponent
    field: ReviewEntriesWordField.Flag,
    // Fix column to minimum width.
    width: 0,
    render: (rowData: ReviewEntriesWord) => (
      <FlagCell value={rowData.flag} rowData={rowData} />
    ),
    editComponent: (props: FieldParameterStandard) => (
      <FlagCell {...props} editable />
    ),
    customFilterAndSearch: (
      filter: string,
      rowData: ReviewEntriesWord
    ): boolean => {
      return rowData.flag.text.includes(filter);
    },
    customSort: (a: ReviewEntriesWord, b: ReviewEntriesWord): number => {
      if (currentSort !== SortStyle.Flag) {
        currentSort = SortStyle.Flag;
      }
      return compareFlags(a.flag, b.flag);
    },
  },

  // History column
  {
    title: ColumnTitle.History,
    filtering: false,
    editable: "never",
    // Fix column to minimum width.
    width: 0,
    render: (rowData: ReviewEntriesWord) => {
      return (
        <HistoryCell historyCount={rowData.historyLength} wordId={rowData.id} />
      );
    },
    customSort: (a: ReviewEntriesWord, b: ReviewEntriesWord): number => {
      if (currentSort !== SortStyle.History) {
        currentSort = SortStyle.History;
      }
      return b.historyLength - a.historyLength;
    },
  },

  // Delete Entry column
  {
    title: ColumnTitle.Delete,
    filtering: false,
    sorting: false,
    editable: "never",
    // Fix column to minimum width.
    width: 0,
    render: (rowData: ReviewEntriesWord) => {
      return <DeleteCell rowData={rowData} />;
    },
  },
];

export default columns;
