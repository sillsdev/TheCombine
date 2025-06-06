import { Stack } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";

import ChildrenRow from "components/TreeView/TreeDepiction/ChildrenRow";
import CurrentRow from "components/TreeView/TreeDepiction/CurrentRow";
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
    <Stack alignItems="center">
      {/* Display current domain and (if available) parent and siblings. */}
      <CurrentRow {...props} colWidth={colWidth} />

      {/* Display subdomains, if available. */}
      {currentDomain.children.length > 0 && (
        <ChildrenRow {...props} colWidth={colWidth} />
      )}
    </Stack>
  );
}
