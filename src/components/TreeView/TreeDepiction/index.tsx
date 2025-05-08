import { Grid2, Theme, useMediaQuery } from "@mui/material";
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
          <Grid2>
            <DomainTileButton
              direction={Direction.Up}
              domain={currentDomain.parent}
              onClick={props.animate}
            />
          </Grid2>
          <Grid2>
            <img
              src={parent}
              style={{ transform: "scaleY(-1)" }}
              width={colWidth}
            />
          </Grid2>
        </>
      )}

      {/* Display current domain and (if available) left and right brothers. */}
      <Grid2>
        <CurrentRow {...props} small={!showTree} />
      </Grid2>

      {/* Display subdomains, if available. */}
      <Grid2>
        {showTree && currentDomain.children.length > 0 && (
          <ChildrenRow {...props} colWidth={colWidth} />
        )}
      </Grid2>
    </>
  );
}
