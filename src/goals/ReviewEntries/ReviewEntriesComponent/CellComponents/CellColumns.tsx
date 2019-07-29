import React from "react";
import { TextField } from "@material-ui/core";

import {
  ReviewEntriesWord,
  ReviewEntriesSense
} from "../ReviewEntriesComponent";
import { SemanticDomain } from "../../../../types/word";
import DomainCell from "../CellComponents";
import DeleteCell from "./DeleteCell";
import { Translate } from "react-localize-redux";
import SenseCell from "./SenseCell";

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
            disableUnderline: !editable
          }}
          // Handles editing word's local vernacular
          onChange={event =>
            props.onRowDataChange &&
            props.onRowDataChange({
              ...props.rowData,
              vernacular: event.target.value
            })
          }
        />
      )}
    </Translate>
  );
}

// Define columns
export default [
  // Vernacular column
  {
    title: "Vernacular",
    field: "vernacular",
    render: (rowData: ReviewEntriesWord) =>
      vernacularField({ rowData, value: rowData.vernacular }, false),
    editComponent: (props: any) => vernacularField(props, true)
  },
  {
    title: "Glosses",
    field: "senses",
    disableClick: true,
    render: (rowData: ReviewEntriesWord) => (
      <SenseCell value={rowData.senses} rowData={rowData} editable={false} />
    ),
    editComponent: (props: any) => (
      <SenseCell
        value={props.value}
        rowData={props.rowData}
        onRowDataChange={props.onRowDataChange}
        editable={true}
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
    render: (rowData: ReviewEntriesWord) => <DomainCell rowData={rowData} />,
    editComponent: (props: any) => {
      const editDomains = (senseId: string, domains: SemanticDomain[]) => {
        if (props.onRowDataChange)
          props.onRowDataChange({
            ...props.rowData,
            senses: props.rowData.senses.map((sense: ReviewEntriesSense) => {
              if (sense.senseId === senseId)
                return {
                  ...sense,
                  domains
                };
              else return sense;
            })
          });
      };
      return <DomainCell rowData={props.rowData} editDomains={editDomains} />;
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
    customSort: (a: any, b: any, type: "row" | "group"): number => {
      let count = 0;
      let compare: number = 0;

      let domainsA: SemanticDomain[];
      let domainsB: SemanticDomain[];

      let codeA: number | undefined;
      let codeB: number | undefined;
      // -: a < b
      // +: a > b
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
          for (
            let c = 0;
            compare === 0 &&
            c < domainsA[d].id.length &&
            c < domainsB[d].id.length;
            c++
          ) {
            codeA = domainsA[d].id.codePointAt(c);
            codeB = domainsB[d].id.codePointAt(c);
            if (codeA && codeB) compare = codeA - codeB;
          }
        }
        count++;
      }

      return compare;
    }
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
            senses: props.rowData.senses.map(sense => {
              if (sense.senseId === senseId)
                return {
                  ...sense,
                  deleted: !sense.deleted
                };
              else return sense;
            })
          });
      };
      return <DeleteCell rowData={props.rowData} delete={deleteSense} />;
    }
  }
];

// export default columns;
