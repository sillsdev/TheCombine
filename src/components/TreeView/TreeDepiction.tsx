import { Grid, ImageList, ImageListItem } from "@material-ui/core";
import React, { ReactElement } from "react";

import DomainTile, { Direction } from "components/TreeView/DomainTile";
import TreeSemanticDomain, {
  DomainMap,
} from "components/TreeView/TreeSemanticDomain";
import { TreeViewHeader } from "components/TreeView/TreeViewHeader";
import {
  endcapLeft,
  endcapRight,
  intersect,
  parent,
  pillar,
  span,
  teeDown,
  teeUpLeft,
  teeUpRight,
} from "resources/tree";

const MAX_COL_WIDTH = 50; // Max gap.
const MIN_COL_WIDTH = 30; // Multiply this by RATIO_TILE_TO_GAP for min tile width.
const RATIO_TILE_TO_GAP = 3; // Must be odd.
const HALF_TILE = (RATIO_TILE_TO_GAP - 1) / 2; // Half of cols-per-tile, rounded down.

interface TreeDepictionProps {
  currentDomain: TreeSemanticDomain;
  domainMap: DomainMap;
  animate: (domain: TreeSemanticDomain) => Promise<void>;
}

interface TreeDepictionState {
  colWidth: number;
}

export default class TreeDepiction extends React.Component<
  TreeDepictionProps,
  TreeDepictionState
> {
  constructor(props: TreeDepictionProps) {
    super(props);
    this.state = { colWidth: 0 };
  }

  // Updates the tile width and adds the resize listener
  componentDidMount() {
    this.updateColWidth();
    window.addEventListener("resize", () => this.updateColWidth());
  }

  // Updates tile width on component update
  componentDidUpdate() {
    this.updateColWidth();
  }

  // Removes the resize listener
  componentWillUnmount() {
    window.removeEventListener("resize", () => this.updateColWidth());
  }

  // Computes a new width for each tile
  updateColWidth() {
    const length = this.props.currentDomain.childIds.length;
    const clientWidth = document.documentElement.clientWidth;
    let colWidth = length
      ? Math.floor(clientWidth / (length * (RATIO_TILE_TO_GAP + 1) - 1))
      : MAX_COL_WIDTH;

    if (colWidth < MIN_COL_WIDTH) {
      colWidth = MIN_COL_WIDTH;
    } else if (colWidth > MAX_COL_WIDTH) {
      colWidth = MAX_COL_WIDTH;
    }

    if (this.state.colWidth !== colWidth) {
      this.setState({ colWidth });
    }
  }

  // Renders the subdomains + their connectors to the current domain
  subDomains(): ReactElement {
    const childIds = this.props.currentDomain.childIds;
    const cols = childIds.length * (RATIO_TILE_TO_GAP + 1) - 1;
    return (
      <ImageList
        cols={cols}
        rowHeight={"auto"}
        gap={0}
        style={{ width: cols * this.state.colWidth }}
      >
        {this.joistRow()}
        {this.domainRow()}
      </ImageList>
    );
  }

  // Creates the joist connecting current domain with subdomains
  joistRow(): ReactElement[] {
    const row: ReactElement[] = [];
    const teeCount = this.props.currentDomain.childIds.length - 2;
    const middleTeeCount = teeCount % 2;
    const halfTeeCount = (teeCount - middleTeeCount) / 2;

    // If there is only one child, the joist row has no branching.
    if (teeCount === -1) {
      row.push(...this.halfTileGap());
      row.push(this.treeTile(pillar));
      row.push(...this.halfTileGap());
      return row;
    }

    /* Left endcap */
    row.push(...this.halfTileGap());
    row.push(this.treeTile(endcapLeft));

    /* Left */
    for (let i = 0; i < halfTeeCount; i++) {
      row.push(...this.multiSpan(RATIO_TILE_TO_GAP));
      row.push(this.treeTile(teeUpRight));
    }

    /* Middle */
    if (middleTeeCount) {
      row.push(...this.multiSpan(RATIO_TILE_TO_GAP));
      row.push(this.treeTile(intersect));
      row.push(...this.multiSpan(RATIO_TILE_TO_GAP));
    } else {
      row.push(...this.multiSpan(HALF_TILE));
      row.push(this.treeTile(teeDown));
      row.push(...this.multiSpan(HALF_TILE));
    }

    /* Right */
    for (let i = 0; i < halfTeeCount; i++) {
      row.push(this.treeTile(teeUpLeft));
      row.push(...this.multiSpan(RATIO_TILE_TO_GAP));
    }

    /* Right endcap */
    row.push(this.treeTile(endcapRight));
    row.push(...this.halfTileGap());

    return row;
  }

  // Places the subdomain tiles
  domainRow(): ReactElement[] {
    const childIds = this.props.currentDomain.childIds;
    const subdomains: ReactElement[] = [];
    childIds.forEach((childId, i) => {
      if (i > 0) {
        subdomains.push(<ImageListItem key={"GapTile" + i} />);
      }
      subdomains.push(
        <ImageListItem key={"DomainTile" + i} cols={RATIO_TILE_TO_GAP}>
          <DomainTile
            domain={this.props.domainMap[childId]}
            onClick={(d) => this.props.animate(d)}
            direction={Direction.Down}
          />
        </ImageListItem>
      );
    });
    return subdomains;
  }

  // Creates a span across multiple columns
  multiSpan(cols: number): ReactElement[] {
    return Array.from({ length: cols }, () => this.treeTile(span));
  }

  // Creates empty items, half (rounded down) as many as there are columns in a tile
  halfTileGap(): ReactElement[] {
    return Array.from({ length: HALF_TILE }, () => (
      <ImageListItem key={"gap" + Math.random()} />
    ));
  }

  // Creates a section of the tree diagram (one of the branches) set to proper dimensions
  treeTile(name: string): ReactElement {
    return (
      <ImageListItem
        key={name + Math.random()}
        style={{ transform: "scaleY(-1)" }}
      >
        <img
          src={name}
          alt={name}
          width={this.state.colWidth + 1} // The +1 is to avoid visual gaps from rounding errors
          height={60}
        />
      </ImageListItem>
    );
  }

  render() {
    const currentDomain = this.props.currentDomain;
    return (
      <React.Fragment>
        {/* Label parent domain, if available */}
        <Grid item>
          {currentDomain.parentId !== undefined && (
            <ImageList
              cols={1}
              gap={0}
              style={{ width: this.state.colWidth * RATIO_TILE_TO_GAP }}
              rowHeight="auto"
            >
              <ImageListItem>
                <DomainTile
                  domain={this.props.domainMap[currentDomain.parentId]}
                  onClick={this.props.animate}
                  direction={Direction.Up}
                />
              </ImageListItem>
              {this.treeTile(parent)}
            </ImageList>
          )}
        </Grid>

        {/* Label current domain and (if available) left and right brothers */}
        <Grid item>
          <TreeViewHeader
            currentDomain={currentDomain}
            domainMap={this.props.domainMap}
            animate={this.props.animate}
          />
        </Grid>

        {/* Label subdomains, if available */}
        <Grid item>
          {currentDomain.childIds.length > 0 && this.subDomains()}
        </Grid>
      </React.Fragment>
    );
  }
}
