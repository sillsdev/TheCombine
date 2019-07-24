import React from "react";
import { TextField, Chip } from "@material-ui/core";
import { Add } from "@material-ui/icons";

import { ViewFinalWord, ViewFinalSense } from "../ViewFinalComponent";
import { SemanticDomain } from "../../../../types/word";
import AlignedList from "./AlignedList";
import DomainCell from "./";
import DeleteCell from "./DeleteCell";
import { uuid } from "../../../../utilities";
import { Translate } from "react-localize-redux";

interface FieldParameterStandard {
  rowData: ViewFinalWord;
  value: any;
  onRowDataChange?: (...args: any) => any;
}

// Creates the editable vernacular text field
function vernacularField(props: FieldParameterStandard, editable: boolean) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <TextField
        key={`vernacular${props.rowData.id}`}
        value={props.value}
        inputProps={{
          readOnly: !editable
        }}
        // Handles editing word's local vernacular
        onChange={event =>
          props.onRowDataChange &&
          props.onRowDataChange({
            ...props.rowData,
            vernacular: event.target.value
          })
        }
        style={{ float: "inline-start" }}
      />
    </div>
  );
}

// Create the sense edit fields
function senseField(props: FieldParameterStandard, editable: boolean) {
  return (
    <AlignedList
      contents={props.rowData.senses.map((sense, index) => (
        <Translate>
          {({ translate }) => (
            <TextField
              key={props.rowData.id}
              value={props.value[index].glosses}
              error={sense.glosses.length === 0}
              disabled={sense.deleted}
              placeholder={translate("viewFinal.nogloss").toString()}
              inputProps={{
                readOnly: !editable
              }}
              // Handles editing sense's local glosses
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
          )}
        </Translate>
      ))}
      bottomCell={
        editable ? (
          <Chip
            label={<Add />}
            // Handles adding a new local sense
            onClick={() =>
              props.onRowDataChange &&
              props.onRowDataChange({
                ...props.rowData,
                senses: [
                  ...props.rowData.senses,
                  {
                    deleted: false,
                    glosses: "",
                    domains: [],
                    senseId: uuid()
                  }
                ]
              })
            }
          />
        ) : null
      }
    />
  );
}

export default [
  // Vernacular column
  {
    title: "Vernacular",
    field: "vernacular",
    render: (rowData: ViewFinalWord) =>
      vernacularField({ rowData, value: rowData.vernacular }, false),
    editComponent: (props: any) => vernacularField(props, true)
  },
  {
    title: "Glosses",
    field: "senses",
    disableClick: true,
    render: (rowData: ViewFinalWord) =>
      senseField({ rowData, value: rowData.senses }, false),
    editComponent: (props: any) => senseField(props, true),
    customFilterAndSearch: (term: string, rowData: ViewFinalWord): boolean => {
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
    render: (rowData: ViewFinalWord) => <DomainCell rowData={rowData} />,
    editComponent: (props: any) => {
      const editDomains = (senseId: string, domains: SemanticDomain[]) => {
        if (props.onRowDataChange)
          props.onRowDataChange({
            ...props.rowData,
            senses: props.rowData.senses.map((sense: ViewFinalSense) => {
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
    customFilterAndSearch: (term: string, rowData: ViewFinalWord): boolean => {
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
    filtering: false,
    render: (rowData: ViewFinalWord) => null,
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
