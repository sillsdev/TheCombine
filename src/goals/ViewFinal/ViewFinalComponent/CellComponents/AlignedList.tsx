import React, { ReactNode } from "react";
import { Grid, Chip } from "@material-ui/core";
import { Add } from "@material-ui/icons";

interface AlignedListProps {
  contents: ReactNode[];
  bottomCell: ReactNode | null;
}

export default class AlignedList extends React.Component<AlignedListProps> {
  render() {
    return (
      <Grid container direction="column" spacing={2}>
        {this.props.contents.map(value => (
          <Grid item xs style={{ borderBottom: "1px solid lightgrey" }}>
            {value}
          </Grid>
        ))}
        <Grid item xs>
          {this.props.bottomCell ? (
            this.props.bottomCell
          ) : (
            <Chip label={<Add />} style={{ opacity: 0.01 }} />
          )}
        </Grid>
      </Grid>
    );
  }
}
