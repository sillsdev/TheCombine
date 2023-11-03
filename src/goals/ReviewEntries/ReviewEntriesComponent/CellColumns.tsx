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
  NoteCell,
  PartOfSpeechCell,
  PronunciationsCell,
  SenseCell,
  VernacularCell,
} from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents";
import {
  ColumnId,
  ReviewEntriesSense,
  ReviewEntriesWord,
  ReviewEntriesWordField,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { compareFlags } from "utilities/wordUtilities";

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

const columns: Column<ReviewEntriesWord>[] = [
  // Vernacular column
  {
    id: ColumnId.Vernacular,
    title: ColumnTitle.Vernacular,
    // field determines what is passed as props.value to editComponent
    field: ReviewEntriesWordField.Vernacular,
    render: (rowData: ReviewEntriesWord) => (
      <VernacularCell rowData={rowData} value={rowData.vernacular} />
    ),
    editComponent: (props: FieldParameterStandard) => (
      <VernacularCell {...props} editable />
    ),
  },

  // Senses column
  {
    id: ColumnId.Senses,
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
    customSort: (a: ReviewEntriesWord, b: ReviewEntriesWord): number =>
      b.senses.length - a.senses.length,
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
    id: ColumnId.Definitions,
    title: ColumnTitle.Definitions,
    // field determines what is passed as props.value to editComponent
    field: ReviewEntriesWordField.Senses,
    disableClick: true,
    render: (rowData: ReviewEntriesWord) => (
      <DefinitionCell rowData={rowData} value={rowData.senses} />
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
    id: ColumnId.Glosses,
    title: ColumnTitle.Glosses,
    // field determines what is passed as props.value to editComponent
    field: ReviewEntriesWordField.Senses,
    disableClick: true,
    render: (rowData: ReviewEntriesWord) => (
      <GlossCell rowData={rowData} value={rowData.senses} />
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
    id: ColumnId.PartOfSpeech,
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
    id: ColumnId.Domains,
    title: ColumnTitle.Domains,
    // field determines what is passed as props.value to editComponent
    field: ReviewEntriesWordField.Senses,
    render: (rowData: ReviewEntriesWord) => <DomainCell rowData={rowData} />,
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
    id: ColumnId.Pronunciations,
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
    customSort: (a: ReviewEntriesWord, b: ReviewEntriesWord): number =>
      b.audio.length - a.audio.length,
  },

  // Note column
  {
    id: ColumnId.Note,
    title: ColumnTitle.Note,
    // field determines what is passed as props.value to editComponent
    field: ReviewEntriesWordField.Note,
    render: (rowData: ReviewEntriesWord) => (
      <Input
        fullWidth
        value={rowData.noteText}
        readOnly
        disableUnderline
        multiline
      />
    ),
    editComponent: (props: FieldParameterStandard) => <NoteCell {...props} />,
  },

  // Flag column
  {
    id: ColumnId.Flag,
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
    customSort: (a: ReviewEntriesWord, b: ReviewEntriesWord): number =>
      compareFlags(a.flag, b.flag),
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
