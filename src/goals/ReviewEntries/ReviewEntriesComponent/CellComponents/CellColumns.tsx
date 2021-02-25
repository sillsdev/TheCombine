import { TextField, Typography } from "@material-ui/core";
import { Column } from "@material-table/core";
import React from "react";
import { Translate } from "react-localize-redux";

import DeleteCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/DeleteCell";
import DomainCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/DomainCell";
import PronunciationsCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/PronunciationsCell";
import SenseCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/SenseCell";
import {
  ReviewEntriesSense,
  ReviewEntriesWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { SemanticDomain } from "types/word";

enum SortStyle {
  // vernacular, noteText: neither have a customSort defined,
  // so there is currently no way to trigger their SortStyles.
  VERNACULAR,
  GLOSS,
  DOMAIN,
  PRONUNCIATIONS,
  NOTETEXT,
  NONE,
}

function domainNumberToArray(id: string) {
  return id.split(".").map((digit) => parseInt(digit, 10));
}

export interface FieldParameterStandard {
  rowData: ReviewEntriesWord;
  value: any;
  onRowDataChange?: (...args: any) => any;
}

// Creates the editable vernacular text field
function vernacularField(props: FieldParameterStandard, editable: boolean) {
  return (
    <Translate>
      {({ translate }) => (
        <TextField
          key={`vernacular${props.rowData.id}`}
          value={props.value}
          error={props.value.length === 0}
          placeholder={translate("reviewEntries.noVernacular").toString()}
          InputProps={{
            readOnly: !editable,
            disableUnderline: !editable,
          }}
          // Handles editing local word
          onChange={(event) =>
            props.onRowDataChange &&
            props.onRowDataChange({
              ...props.rowData,
              vernacular: event.target.value,
            })
          }
        />
      )}
    </Translate>
  );
}

// Creates the editable note text field
function noteField(props: FieldParameterStandard) {
  return (
    <Translate>
      {({ translate }) => (
        <TextField
          key={`vernacular${props.rowData.id}`}
          value={props.value}
          placeholder={translate("reviewEntries.noNote").toString()}
          // Handles editing local word
          onChange={(event) =>
            props.onRowDataChange &&
            props.onRowDataChange({
              ...props.rowData,
              noteText: event.target.value,
            })
          }
        />
      )}
    </Translate>
  );
}

let currentSort: SortStyle = SortStyle.NONE;
const columns: Column<any>[] = [
  // Vernacular column
  {
    title: "Vernacular",
    field: "vernacular",
    render: (rowData: ReviewEntriesWord) =>
      vernacularField({ rowData, value: rowData.vernacular }, false),
    editComponent: (props: FieldParameterStandard) =>
      vernacularField(props, true),
  },
  // Glosses column
  {
    title: "Glosses",
    field: "senses",
    disableClick: true,
    render: (rowData: ReviewEntriesWord) => (
      <SenseCell
        value={rowData.senses}
        rowData={rowData}
        editable={false}
        sortingByGloss={currentSort === SortStyle.GLOSS}
      />
    ),
    editComponent: (props: FieldParameterStandard) => (
      <SenseCell
        value={props.value}
        rowData={props.rowData}
        onRowDataChange={props.onRowDataChange}
        editable={true}
        sortingByGloss={false}
      />
    ),
    customFilterAndSearch: (
      term: string,
      rowData: ReviewEntriesWord
    ): boolean => {
      const regex = new RegExp(term.trim().toLowerCase());
      for (const sense of rowData.senses) {
        const glossesString = ReviewEntriesSense.glossString(sense);
        if (regex.exec(glossesString.toLowerCase()) !== null) {
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
        const glossStringA = ReviewEntriesSense.glossString(a.senses[count]);
        const glossStringB = ReviewEntriesSense.glossString(b.senses[count]);
        if (glossStringA !== glossStringB) {
          const glossStrings = [glossStringA, glossStringB];
          glossStrings.sort();
          if (glossStringA === glossStrings[0]) {
            return -1;
          }
          return 1;
        }
      }
      return a.senses.length - b.senses.length;
    },
  },
  // Delete Sense column
  {
    title: "",
    field: "id",
    filtering: false,
    sorting: false,
    render: () => null,
    editComponent: (props: FieldParameterStandard) => {
      const deleteSense = (senseId: string) => {
        if (props.onRowDataChange)
          props.onRowDataChange({
            ...props.rowData,
            senses: props.rowData.senses.map((sense) => {
              if (sense.senseId === senseId)
                return {
                  ...sense,
                  deleted: !sense.deleted,
                };
              else return sense;
            }),
          });
      };
      return <DeleteCell rowData={props.rowData} delete={deleteSense} />;
    },
  },
  // Semantic Domains column
  {
    title: "Domains",
    field: "domains",
    render: (rowData: ReviewEntriesWord) => (
      <DomainCell
        rowData={rowData}
        sortingByDomains={currentSort === SortStyle.DOMAIN}
      />
    ),
    editComponent: (props: FieldParameterStandard) => {
      const editDomains = (senseId: string, domains: SemanticDomain[]) => {
        if (props.onRowDataChange)
          props.onRowDataChange({
            ...props.rowData,
            senses: props.rowData.senses.map((sense) => {
              if (sense.senseId === senseId)
                return {
                  ...sense,
                  domains,
                };
              else return sense;
            }),
          });
      };
      return (
        <DomainCell
          rowData={props.rowData}
          editDomains={editDomains}
          sortingByDomains={false}
        />
      );
    },
    customFilterAndSearch: (
      term: string,
      rowData: ReviewEntriesWord
    ): boolean => {
      /*
       * Search term expected in one of two formats:
       * 1. id (e.g., "2.1") XOR name (e.g., "bod")
       * 2. id AND name, colon-seperated (e.g., "2.1:ody")
       *   All the above examples would find entries with "2.1: Body"
       * IGNORED: capitalization; whitespace around terms; 3+ terms
       *   e.g. " 2.1:BODY:zx:c  " and "2.1  : Body " are equivalent
       */
      const terms = term.split(":").map((t) => t.trim().toLowerCase());
      if (terms.length === 1) {
        const regex: RegExp = new RegExp(terms[0]);
        for (const sense of rowData.senses)
          for (const domain of sense.domains)
            if (
              regex.exec(domain.id) !== null ||
              regex.exec(domain.name.toLowerCase()) !== null
            )
              return true;
      } else {
        const regexNumber: RegExp = new RegExp(terms[0]);
        const regexName: RegExp = new RegExp(terms[1]);
        for (const sense of rowData.senses)
          for (const domain of sense.domains)
            if (
              regexNumber.exec(domain.id) !== null &&
              regexName.exec(domain.name.toLowerCase()) !== null
            )
              return true;
      }
      return false;
    },
    customSort: (a: ReviewEntriesWord, b: ReviewEntriesWord): number => {
      if (currentSort !== SortStyle.DOMAIN) {
        currentSort = SortStyle.DOMAIN;
      }

      let count = 0;
      let compare: number = 0;

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
    title: "Pronunciations",
    field: "pronunciations",
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
      if (currentSort !== SortStyle.PRONUNCIATIONS) {
        currentSort = SortStyle.PRONUNCIATIONS;
      }
      return b.pronunciationFiles.length - a.pronunciationFiles.length;
    },
  },
  // Note column
  {
    title: "Note",
    field: "noteText",
    render: (rowData: ReviewEntriesWord) => (
      <Typography>{rowData.noteText}</Typography>
    ),
    editComponent: (props: FieldParameterStandard) => noteField(props),
  },
  // Delete Entry column
  {
    title: "Delete",
    field: "delete",
    filtering: false,
    sorting: false,
    editable: "never",
    render: (rowData: ReviewEntriesWord) => {
      return <DeleteCell rowData={rowData} />;
    },
  },
];

export default columns;
