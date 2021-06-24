import { Chip, Grid } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { ReactNode } from "react";

export const SPACER = "spacer";
interface AlignedListProps {
  contents: ReactNode[];
  listId: string;
  bottomCell: ReactNode | typeof SPACER | null;
}

export default function AlignedList(props: AlignedListProps) {
  return (
    <Grid container direction="column" spacing={2}>
      {props.contents.map((value, index) => (
        <Grid
          item
          xs
          key={`alignedList:${props.listId}:${index}`}
          style={
            props.bottomCell || index + 1 !== props.contents.length
              ? {
                  borderBottom: "1px solid lightgrey",
                }
              : {}
          }
        >
          {value}
        </Grid>
      ))}
      {props.bottomCell && (
        <Grid item xs>
          {props.bottomCell !== SPACER ? (
            props.bottomCell
          ) : (
            <Chip label={<Add />} style={{ opacity: 0.01 }} />
          )}
        </Grid>
      )}
    </Grid>
  );
}
