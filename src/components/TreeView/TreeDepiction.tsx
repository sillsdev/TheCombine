import { Grid, ImageList, ImageListItem } from "@material-ui/core";
import React, { ReactElement } from "react";

import DomainTile, { Direction } from "components/TreeView/DomainTile";
import TreeSemanticDomain from "components/TreeView/TreeSemanticDomain";
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
    const length = this.props.currentDomain.subdomains.length;
    let colWidth = length
      ? Math.floor(
          document.documentElement.clientWidth /
            (length * (RATIO_TILE_TO_GAP + 1) - 1)
        )
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
    const subdomains = this.props.currentDomain.subdomains;
    const cols = subdomains.length * (RATIO_TILE_TO_GAP + 1) - 1;
    return subdomains.length > 1 ? (
      <ImageList
        cols={cols}
        rowHeight={"auto"}
        gap={0}
        style={{ width: cols * this.state.colWidth }}
      >
        {/* Tree branches */}
        {this.joistRow()}

        {/* Content */}
        {this.domainRow()}
      </ImageList>
    ) : (
      <ImageList
        cols={RATIO_TILE_TO_GAP}
        gap={0}
        rowHeight={"auto"}
        style={{ width: this.state.colWidth * RATIO_TILE_TO_GAP }}
      >
        {this.halfTileGap()}
        {this.treeTile(pillar)}
        {this.halfTileGap()}
        <ImageListItem cols={RATIO_TILE_TO_GAP}>
          <DomainTile
            domain={subdomains[0]}
            onClick={this.props.animate}
            direction={Direction.Down}
          />
        </ImageListItem>
      </ImageList>
    );
  }

  // Creates the joist connecting current domain with subdomains
  joistRow(): ReactElement[] {
    const row: ReactElement[] = [];
    const teeCount = this.props.currentDomain.subdomains.length - 2;
    const middleTeeCount = teeCount % 2;
    const halfTeeCount = (teeCount - middleTeeCount) / 2;

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

  // Places the actual sub domain tiles
  domainRow(): ReactElement[] {
    const subDomains: ReactElement[] = [];
    let domainIndex = 0;

    for (
      let i = 0;
      i < this.props.currentDomain.subdomains.length * 2 - 1;
      i++
    ) {
      if (i % 2 === 0) {
        subDomains.push(
          <ImageListItem
            key={domainIndex + "DomainTile"}
            cols={RATIO_TILE_TO_GAP}
          >
            <DomainTile
              domain={this.props.currentDomain.subdomains[domainIndex]}
              onClick={this.props.animate}
              direction={Direction.Down}
            />
          </ImageListItem>
        );
        domainIndex++;
      } else {
        subDomains.push(<ImageListItem key={domainIndex + "DummyTile"} />);
      }
    }
    return subDomains;
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
    return (
      <React.Fragment>
        {/* Label parent domain, if available */}
        <Grid item>
          {this.props.currentDomain.parentDomain && (
            <ImageList
              cols={1}
              gap={0}
              style={{ width: this.state.colWidth * RATIO_TILE_TO_GAP }}
              rowHeight="auto"
            >
              <ImageListItem>
                <DomainTile
                  domain={this.props.currentDomain.parentDomain}
                  onClick={this.props.animate}
                  direction={Direction.Up}
                />
              </ImageListItem>
              {this.treeTile(parent)}
            </ImageList>
          )}
        </Grid>

        {/* Label current domain, and left and right brothers, if available */}
        <Grid item>
          <TreeViewHeader
            currentDomain={this.props.currentDomain}
            animate={this.props.animate}
          />
        </Grid>

        {/* Label subdomains, if available */}
        <Grid item>
          {this.props.currentDomain.subdomains.length > 0 && this.subDomains()}
        </Grid>
      </React.Fragment>
    );
  }
}
