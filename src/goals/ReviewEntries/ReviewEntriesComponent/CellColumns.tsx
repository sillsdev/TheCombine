import { Column } from "@material-table/core";
import { Input, Typography } from "@material-ui/core";

import { SemanticDomain } from "api/models";
import {
  DefinitionCell,
  DeleteCell,
  DomainCell,
  FlagCell,
  GlossCell,
  NoteCell,
  PronunciationsCell,
  SenseCell,
  VernacularCell,
} from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents";
import {
  ReviewEntriesSense,
  ReviewEntriesWord,
  ReviewEntriesWordField,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { compareFlags } from "types/wordUtilities";

enum SortStyle {
  // vernacular, noteText: neither have a customSort defined,
  // so there is currently no way to trigger their SortStyles.
  //Vernacular,
  Sense,
  Definition,
  Gloss,
  Domain,
  Pronunciation,
  //Note,
  Flag,
  None,
}

export enum ColumnTitle {
  Vernacular = "Vernacular",
  Senses = "Senses",
  Definitions = "Definitions",
  Glosses = "Glosses",
  Domains = "Domains",
  Pronunciations = "Pronunciations",
  Note = "Note",
  Flag = "Flag",
  Delete = "Delete",
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
          if (compare === 0) compare = codeA.length - codeB.length;
        }
        count++;
      }

      return compare;
    },
  },

  // Audio column
  {
    title: ColumnTitle.Pronunciations,
    field: ReviewEntriesWordField.Pronunciations,
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
      if (currentSort !== SortStyle.Pronunciation) {
        currentSort = SortStyle.Pronunciation;
      }
      return b.pronunciationFiles.length - a.pronunciationFiles.length;
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
