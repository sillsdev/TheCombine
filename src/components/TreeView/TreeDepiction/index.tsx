import { Grid, Theme, useMediaQuery } from "@mui/material";
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
  const showTree = useMediaQuery<Theme>((th) => th.breakpoints.up("sm"));

  const [colWidth, setColWidth] = useState(0);

  const { windowWidth } = useWindowSize();

  useEffect(() => {
    setColWidth(getColWidth(props.currentDomain.children.length, windowWidth));
  }, [props, windowWidth]);

  const currentDomain = props.currentDomain;
  return (
    <>
      {/* Display parent domain, if available. */}
      {showTree && currentDomain.parent && (
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

      {/* Display current domain and (if available) left and right brothers. */}
      <Grid item>
        <CurrentRow {...props} small={!showTree} />
      </Grid>

      {/* Display subdomains, if available. */}
      <Grid item>
        {showTree && currentDomain.children.length > 0 && (
          <ChildrenRow {...props} colWidth={colWidth} />
        )}
      </Grid>
    </>
  );
}
