import { Column } from "@material-table/core";
import { Input, Typography } from "@material-ui/core";

import { SemanticDomain } from "api/models";
import DefinitionCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/DefinitionCell";
import DeleteCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/DeleteCell";
import DomainCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/DomainCell";
import FlagCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/FlagCell";
import GlossCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/GlossCell";
import NoteCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/NoteCell";
import PronunciationsCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/PronunciationsCell";
import SenseCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/SenseCell";
import VernacularCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/VernacularCell";
import {
  ReviewEntriesSense,
  ReviewEntriesWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { compareFlags } from "types/wordUtilities";

enum SortStyle {
  // vernacular, noteText: neither have a customSort defined,
  // so there is currently no way to trigger their SortStyles.
  //VERNACULAR,
  SENSE,
  DEFINITION,
  GLOSS,
  DOMAIN,
  PRONUNCIATION,
  //NOTE_TEXT,
  FLAG,
  NONE,
}

export enum ColumnTitle {
  VERNACULAR = "Vernacular",
  SENSES = "Senses",
  DEFINITIONS = "Definitions",
  GLOSSES = "Glosses",
  DOMAINS = "Domains",
  PRONUNCIATIONS = "Pronunciations",
  NOTE = "Note",
  FLAG = "Flag",
  DELETE = "Delete",
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
  onRowDataChange?: (...args: any) => any;
}

let currentSort: SortStyle = SortStyle.NONE;
const columns: Column<any>[] = [
  // Vernacular column
  {
    title: ColumnTitle.VERNACULAR,
    field: ColumnTitle.VERNACULAR,
    render: (rowData: ReviewEntriesWord) => (
      <VernacularCell rowData={rowData} value={rowData.vernacular} />
    ),
    editComponent: (props: FieldParameterStandard) => (
      <VernacularCell {...props} editable />
    ),
  },
  // Sense column
  {
    title: ColumnTitle.SENSES,
    field: ColumnTitle.SENSES,
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
      if (currentSort !== SortStyle.SENSE) {
        currentSort = SortStyle.SENSE;
      }
      return b.senses.length - a.senses.length;
    },
    editComponent: (props: FieldParameterStandard) => {
      const deleteSense = (guid: string) => {
        if (props.onRowDataChange) {
          props.onRowDataChange({
            ...props.rowData,
            senses: props.rowData.senses.map((s) =>
              s.guid === guid ? { ...s, deleted: !s.deleted } : s
            ),
          });
        }
      };
      return <SenseCell {...props} delete={deleteSense} value />;
    },
  },
  // Definitions column
  {
    title: ColumnTitle.DEFINITIONS,
    field: ColumnTitle.DEFINITIONS,
    disableClick: true,
    render: (rowData: ReviewEntriesWord) => (
      <DefinitionCell
        value={rowData.senses}
        rowData={rowData}
        sortingByThis={currentSort === SortStyle.DEFINITION}
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
      if (currentSort !== SortStyle.DEFINITION) {
        currentSort = SortStyle.DEFINITION;
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
    title: ColumnTitle.GLOSSES,
    field: ColumnTitle.GLOSSES,
    disableClick: true,
    render: (rowData: ReviewEntriesWord) => (
      <GlossCell
        value={rowData.senses}
        rowData={rowData}
        sortingByThis={currentSort === SortStyle.GLOSS}
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
      if (currentSort !== SortStyle.GLOSS) {
        currentSort = SortStyle.GLOSS;
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
  // Semantic Domains column
  {
    title: ColumnTitle.DOMAINS,
    field: ColumnTitle.DOMAINS,
    render: (rowData: ReviewEntriesWord) => (
      <DomainCell
        rowData={rowData}
        sortingByThis={currentSort === SortStyle.DOMAIN}
      />
    ),
    editComponent: (props: FieldParameterStandard) => {
      const editDomains = (guid: string, domains: SemanticDomain[]) => {
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
        for (const sense of rowData.senses)
          for (const domain of sense.domains)
            if (
              regex.exec(domain.id) ||
              regex.exec(domain.name.toLowerCase())
            ) {
              return true;
            }
      } else {
        const regexNumber = cleanRegExp(terms[0]);
        const regexName = cleanRegExp(terms[1]);
        for (const sense of rowData.senses)
          for (const domain of sense.domains)
            if (
              regexNumber.exec(domain.id) &&
              regexName.exec(domain.name.toLowerCase())
            ) {
              return true;
            }
      }
      return false;
    },
    customSort: (a: ReviewEntriesWord, b: ReviewEntriesWord): number => {
      if (currentSort !== SortStyle.DOMAIN) {
        currentSort = SortStyle.DOMAIN;
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
          if (compare === 0) compare = codeA.length - codeB.length;
        }
        count++;
      }

      return compare;
    },
  },
  // Audio column
  {
    title: ColumnTitle.PRONUNCIATIONS,
    field: ColumnTitle.PRONUNCIATIONS,
    editable: "never",
    filterPlaceholder: "#",
    render: (rowData: ReviewEntriesWord) => (
      <PronunciationsCell
        wordId={rowData.id}
        pronunciationFiles={rowData.pronunciationFiles}
        recorder={rowData.recorder}
      />
    ),
    customFilterAndSearch: (
      filter: string,
      rowData: ReviewEntriesWord
    ): boolean => {
      return parseInt(filter) === rowData.pronunciationFiles.length;
    },
    customSort: (a: ReviewEntriesWord, b: ReviewEntriesWord): number => {
      if (currentSort !== SortStyle.PRONUNCIATION) {
        currentSort = SortStyle.PRONUNCIATION;
      }
      return b.pronunciationFiles.length - a.pronunciationFiles.length;
    },
  },
  // Note column
  {
    title: ColumnTitle.NOTE,
    field: ColumnTitle.NOTE,
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
  },
  // Flag column
  {
    title: ColumnTitle.FLAG,
    field: ColumnTitle.FLAG,
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
      if (currentSort !== SortStyle.FLAG) {
        currentSort = SortStyle.FLAG;
      }
      return compareFlags(a.flag, b.flag);
    },
  },
  // Delete Entry column
  {
    title: ColumnTitle.DELETE,
    field: ColumnTitle.DELETE,
    filtering: false,
    sorting: false,
    editable: "never",
    // Fix column to minimum width.
    width: 0,
    render: (rowData: ReviewEntriesWord) => {
      return <DeleteCell rowData={rowData} value />;
    },
  },
];

export default columns;
