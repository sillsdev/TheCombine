import { Grid, ImageList, ImageListItem } from "@material-ui/core";
import React, { ReactNode } from "react";

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
import DomainTile, { Direction } from "components/TreeView/DomainTile";
import TreeSemanticDomain from "components/TreeView/TreeSemanticDomain";
import { TreeViewHeader } from "components/TreeView/TreeViewHeader";

const MAX_TILE_WIDTH = 150;
const MIN_TILE_WIDTH = 75;

interface TreeDepictionProps {
  currentDomain: TreeSemanticDomain;
  animate: (domain: TreeSemanticDomain) => Promise<void>;
}

interface TreeDepictionState {
  tileWidth: number;
  bounce: number;
}

export default class TreeDepiction extends React.Component<
  TreeDepictionProps,
  TreeDepictionState
> {
  constructor(props: TreeDepictionProps) {
    super(props);
    this.state = { tileWidth: 0, bounce: 0 };

    // Bind functions
    this.updateTileWidth = this.updateTileWidth.bind(this);
  }

  // Updates the tile width and adds the resize listener
  componentDidMount() {
    this.updateTileWidth();
    window.addEventListener("resize", this.updateTileWidth);
  }

  // Updates tile width on component update
  componentDidUpdate() {
    this.updateTileWidth();
  }

  // Removes the resize listener
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateTileWidth);
  }

  // Computes a new width for each tile
  updateTileWidth() {
    const length = this.props.currentDomain.subdomains.length;
    let tileWidth =
      length > 0
        ? Math.floor(document.documentElement.clientWidth / (length * 2 - 1))
        : MAX_TILE_WIDTH;

    if (tileWidth < MIN_TILE_WIDTH) {
      tileWidth = MIN_TILE_WIDTH;
    } else if (tileWidth > MAX_TILE_WIDTH) {
      tileWidth = MAX_TILE_WIDTH;
    }

    if (Math.floor(this.state.tileWidth) !== Math.floor(tileWidth)) {
      this.setState({ tileWidth });
    }
  }

  // Renders the subdomains + their connectors to the current domain
  subDomains(): ReactNode {
    const subdomains = this.props.currentDomain.subdomains;
    return subdomains.length > 1 ? (
      <ImageList
        cols={subdomains.length * 2 - 1} // # of cells across the joist is
        rowHeight={"auto"}
        gap={0}
        style={{ width: (subdomains.length * 2 - 1) * this.state.tileWidth }}
      >
        {/* Left endcap */}
        {this.treeTile(endcapLeft)}

        {/* Add tree branch */}
        {this.joistRow()}

        {/* Right endcap */}
        {this.treeTile(endcapRight)}

        {/* Content */}
        {this.domainRow()}
      </ImageList>
    ) : (
      <ImageList
        cols={1}
        gap={0}
        rowHeight={"auto"}
        style={{ width: this.state.tileWidth }}
      >
        {this.treeTile(pillar)}
        <ImageListItem>
          <DomainTile
            domain={subdomains[0]}
            onClick={(e) => {
              this.props.animate(e);
              this.setState({ bounce: Math.random() });
            }}
            direction={Direction.Down}
          />
        </ImageListItem>
      </ImageList>
    );
  }

  // Creates the joist connecting current domain with subdomains
  joistRow(): ReactNode[] {
    const row: ReactNode[] = [];
    const half = this.props.currentDomain.subdomains.length - 2;

    // Determine the kind of middle element needed
    const middleElement = half % 2 === 0 ? teeDown : intersect;

    // Add elements on left, then the center, then the right
    this.halfJoist(half, row, true, true);
    row[half] = this.treeTile(middleElement);
    this.halfJoist(half, row, middleElement === intersect, false);

    return row;
  }

  // Helper function for joistRow: creates an alternating pattern of tees and spans, based on an initial starting type
  halfJoist(
    half: number,
    row: ReactNode[],
    startWithSpan: boolean,
    right: boolean
  ) {
    const valForSpan = startWithSpan ? 0 : 1;
    for (let count = 0; count < half; count++) {
      const tileToPush =
        count % 2 === valForSpan ? span : right ? teeUpRight : teeUpLeft;
      row.push(this.treeTile(tileToPush));
    }
  }

  // Places the actual sub domain tiles
  domainRow(): ReactNode[] {
    let subDomains: ReactNode[] = [];
    let domainIndex: number = 0;

    for (
      let i: number = 0;
      i < this.props.currentDomain.subdomains.length * 2 - 1;
      i++
    ) {
      if (i % 2 === 0) {
        subDomains.push(
          <ImageListItem key={domainIndex + "DomainTile"}>
            <DomainTile
              domain={this.props.currentDomain.subdomains[domainIndex]}
              onClick={(e) => {
                this.props.animate(e);
                this.setState({ bounce: Math.random() });
              }}
              direction={Direction.Down}
            />
          </ImageListItem>
        );
        domainIndex++;
      } else subDomains.push(<ImageListItem key={domainIndex + "DummyTile"} />);
    }
    return subDomains;
  }

  // Creates a section of the tree diagram (one of the branches) set to proper dimensions
  treeTile(name: string): ReactNode {
    return (
      <ImageListItem
        key={name + Math.random() * 1000}
        style={{ transform: "scaleY(-1)" }}
      >
        <img
          src={name}
          alt={name}
          width={this.state.tileWidth}
          height={"100%"}
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
              style={{ width: this.state.tileWidth }}
              rowHeight="auto"
            >
              <ImageListItem>
                <DomainTile
                  domain={this.props.currentDomain.parentDomain}
                  onClick={(e) => {
                    this.props.animate(e);
                    this.setState({ bounce: Math.random() });
                  }}
                  direction={Direction.Up}
                />
              </ImageListItem>
              {this.treeTile(parent)}
            </ImageList>
          )}
        </Grid>

        {/* Label current domain */}
        <Grid item>
          <TreeViewHeader
            currentDomain={this.props.currentDomain}
            animate={this.props.animate}
            bounceState={this.state.bounce}
            bounce={() => {
              this.setState({ bounce: Math.random() });
            }}
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
