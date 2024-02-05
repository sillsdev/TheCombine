import { Grid, Hidden } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";

import ChildrenRow from "components/TreeView/TreeDepiction/ChildrenRow";
import CurrentRow from "components/TreeView/TreeDepiction/CurrentRow";
import DomainTileButton from "components/TreeView/TreeDepiction/DomainTileButton";
import {
  Direction,
  TreeDepictionProps,
  getColWidth,
} from "components/TreeView/TreeDepiction/TreeDepictionTypes";
import { parent } from "resources/tree";
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
      <Hidden smDown>
        {currentDomain.parent && (
          <>
            <Grid item>
              <DomainTileButton
                direction={Direction.Up}
                domain={currentDomain.parent}
                onClick={props.animate}
              />
            </Grid>
            <Grid item>
              <img
                src={parent}
                style={{ transform: "scaleY(-1)" }}
                width={colWidth}
              />
            </Grid>
          </>
        )}
      </Hidden>

      {/* Display current domain and (if available) left and right brothers. */}
      <Grid item>
        <Hidden smDown>
          <CurrentRow {...props} />
        </Hidden>
        <Hidden smUp>
          <CurrentRow {...props} small />
        </Hidden>
      </Grid>

      {/* Display subdomains, if available. */}
      <Hidden smDown>
        <Grid item>
          {currentDomain.children.length > 0 && (
            <ChildrenRow {...props} colWidth={colWidth} />
          )}
        </Grid>
      </Hidden>
    </>
  );
}
