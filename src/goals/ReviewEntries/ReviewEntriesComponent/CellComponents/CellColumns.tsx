import React from "react";
import { TextField } from "@material-ui/core";

import { ReviewEntriesWord, ReviewEntriesSense } from "../ReviewEntriesTypes";
import { SemanticDomain } from "../../../../types/word";
import DomainCell from "./DomainCell";
import DeleteCell from "./DeleteCell/index";
import { Translate } from "react-localize-redux";
import SenseCell from "./SenseCell";
import { Column } from "material-table";
import PronunciationsCell from "./PronunciationsCell";

enum SortStyle {
  VERNACULAR,
  GLOSS,
  DOMAIN,
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
          placeholder={translate("reviewEntries.novernacular").toString()}
          InputProps={{
            readOnly: !editable,
            disableUnderline: !editable,
          }}
          // Handles editing word's local vernacular
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

let currentSort: SortStyle = SortStyle.NONE;
const columns: Column<any>[] = [
  // Vernacular column
  {
    title: "Vernacular",
    field: "vernacular",
    render: (rowData: ReviewEntriesWord) =>
      vernacularField({ rowData, value: rowData.vernacular }, false),
    editComponent: (props: any) => vernacularField(props, true),
  },
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
    editComponent: (props: any) => (
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
      let regex: RegExp = new RegExp(term);
      for (let sense of rowData.senses)
        if (regex.exec(sense.glosses) !== null) return true;
      return false;
    },
    customSort: (a: any, b: any, type: "row" | "group"): number => {
      let count = 0;
      let compare: number = 0;

      // IDs that we're sorting by gloss
      if (currentSort !== SortStyle.GLOSS) currentSort = SortStyle.GLOSS;

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
    },
  },
  {
    title: "",
    field: "id",
    filtering: false,
    sorting: false,
    render: (rowData: ReviewEntriesWord) => null,
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
  {
    title: "Domains",
    field: "domains",
    render: (rowData: ReviewEntriesWord) => (
      <DomainCell
        rowData={rowData}
        sortingByDomains={currentSort === SortStyle.DOMAIN}
      />
    ),
    editComponent: (props: any) => {
      const editDomains = (senseId: string, domains: SemanticDomain[]) => {
        if (props.onRowDataChange)
          props.onRowDataChange({
            ...props.rowData,
            senses: props.rowData.senses.map((sense: ReviewEntriesSense) => {
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
    customSort: (a: any, b: any): number => {
      let count = 0;
      let compare: number = 0;

      let domainsA: SemanticDomain[];
      let domainsB: SemanticDomain[];

      let codeA: number[];
      let codeB: number[];

      // Sets that we're sorting by domain
      if (currentSort !== SortStyle.DOMAIN) currentSort = SortStyle.DOMAIN;

      // Special case: no senses
      if (a.senses === undefined || a.senses.length === 0) return 1;
      else if (b.senses === undefined || b.senses.length === 0) return -1;

      while (
        compare === 0 &&
        count < a.senses.length &&
        count < b.senses.length
      ) {
        domainsA = a.senses[count].domains;
        domainsB = b.senses[count].domains;

        // If one has no domains, it is the lower rank
        if (domainsA.length === 0) return 1;
        else if (domainsB.length === 0) return -1;

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
  {
    title: "Pronunciations",
    field: "pronunciations",
    editable: "never",
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
    customSort: (a: any, b: any): number => {
      const aAudioCount = a?.pronunciationFiles
        ? a.pronunciationFiles.length
        : 0;
      const bAudioCount = b?.pronunciationFiles
        ? b.pronunciationFiles.length
        : 0;
      return bAudioCount - aAudioCount;
    },
  },
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
