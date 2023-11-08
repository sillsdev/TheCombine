import { Grid } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";

import ChildrenRow from "components/TreeView/TreeDepiction/ChildrenRow";
import CurrentRow from "components/TreeView/TreeDepiction/CurrentRow";
import ParentRow from "components/TreeView/TreeDepiction/ParentRow";
import {
  TreeDepictionProps,
  getColWidth,
} from "components/TreeView/TreeDepiction/TreeDepictionTypes";
import { useWindowSize } from "utilities/useWindowSize";

export default function TreeDepiction(props: TreeDepictionProps): ReactElement {
  const [colWidth, setColWidth] = useState(0);

  const { windowWidth } = useWindowSize();

  useEffect(() => {
    setColWidth(getColWidth(props.currentDomain.children.length, windowWidth));
  }, [props, windowWidth]);

  const currentDomain = props.currentDomain;
  return (
    <>
      {/* Display parent domain, if available. */}
      <Grid item>
        {currentDomain.parent && <ParentRow {...props} colWidth={colWidth} />}
      </Grid>

      {/* Display current domain and (if available) left and right brothers. */}
      <Grid item>
        <CurrentRow {...props} />
      </Grid>

      {/* Display subdomains, if available. */}
      <Grid item>
        {currentDomain.children.length > 0 && (
          <ChildrenRow {...props} colWidth={colWidth} />
        )}
      </Grid>
    </>
  );
}
