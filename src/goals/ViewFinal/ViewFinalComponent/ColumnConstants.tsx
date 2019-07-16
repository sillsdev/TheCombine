import React, { ReactNode } from "react";
import { Typography, Grid } from "@material-ui/core";
import { ViewFinalWord } from "./ViewFinalComponent";

// export interface TableCol {
//   title: string;
//   field: string;
//   render: (rowData: ViewFinalWord) => ReactNode;
// }

// export const VERN: TableCol = {
//   title: "Vernacular:",
//   field: "vernacular",
//   render: (rowData: ViewFinalWord) => (
//     <Typography variant="body1">{rowData.vernacular}</Typography>
//   )
// };

function multilineStringToReactElement(option: string): ReactNode {
  return (
    <Grid container direction={"column"}>
      {option.split("\n").map((value: string) => (
        <Grid item xs>
          <Typography variant={"body1"}>{value}</Typography>
        </Grid>
      ))}
    </Grid>
  );
}

export default [
  { title: "Vernacular", field: "vernacular" },
  {
    title: "Glosses",
    field: "glosses",
    render: (rowData: ViewFinalWord) =>
      multilineStringToReactElement(rowData.glosses)
  },
  {
    title: "Domains",
    field: "domains",
    render: (rowData: ViewFinalWord) =>
      multilineStringToReactElement(rowData.domains)
  }
];

// export const SEMANTIC: TableCol = {
//   title: "Semantic Domains:",
//   field: "senses.domains",
//   render: (rowData: ViewFinalWord) => {
//     let nodeArray: ReactNode[] = [];
//     let buffer: string;

//     for (let sense of rowData.senses) {
//       buffer = "";
//       for (let domain of sense.domains) buffer += `${domain};  `; //`${domain.number}- ${domain.name};  `;
//       nodeArray.push(
//         <Typography variant="body1">{buffer.slice(0, -3)}</Typography>
//       );
//     }

//     return (
//       <Grid container direction="column">
//         {nodeArray.map(value => (
//           <Grid item xs>
//             {value}
//           </Grid>
//         ))}
//       </Grid>
//     );
//   }
// };

// export const GLOSS: (language: string) => TableCol = (language: string) => {
//   return {
//     title: `Gloss (${language}):`,
//     field: "senses.glosses",
//     render: (rowData: ViewFinalWord) => {
//       let nodeArray: ReactNode[] = [];
//       let buffer: string;

//       for (let sense of rowData.senses) {
//         buffer = "";
//         for (let gloss of sense.glosses) buffer += `${gloss};  `;
//         nodeArray.push(
//           <Typography variant="body1">{buffer.slice(0, -3)}</Typography>
//         );
//       }

//       return (
//         <Grid container direction="column">
//           {nodeArray.map(value => (
//             <Grid item xs>
//               {value}
//             </Grid>
//           ))}
//         </Grid>
//       );
//     }
//   };
// };
