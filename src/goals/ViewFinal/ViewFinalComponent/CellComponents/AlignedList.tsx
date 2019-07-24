import React, { ReactNode } from "react";
import { Grid, Chip } from "@material-ui/core";
import { Add } from "@material-ui/icons";

export const SPACER: string = "spacer";
interface AlignedListProps {
  contents: ReactNode[];
  bottomCell: ReactNode | typeof SPACER | null;
}

// const HEIGHT: number = 150;

export default class AlignedList extends React.Component<AlignedListProps> {
  render() {
    return (
      <Grid
        container
        direction="column"
        spacing={2}
        // style={{ height: `${HEIGHT * this.props.contents.length}px` }}
      >
        {this.props.contents.map((value, index) => (
          <Grid
            item
            xs
            style={{
              // height: `${HEIGHT}px`,
              borderBottom: "1px solid lightgrey"
            }}
            key={`aligned${index}`}
          >
            {value}
          </Grid>
        ))}
        <Grid item xs>
          {this.props.bottomCell !== SPACER ? (
            this.props.bottomCell
          ) : (
            <Chip label={<Add />} style={{ opacity: 0.01 }} />
          )}
        </Grid>
      </Grid>
    );
  }
}
