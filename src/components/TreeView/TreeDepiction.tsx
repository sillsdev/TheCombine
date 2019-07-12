import React, { ReactNode } from "react";
import {
  GridList,
  GridListTile,
  Button,
  Typography,
  Grid
} from "@material-ui/core";
import SemanticDomain from "./SemanticDomain";

// Images
import endcapL from "../../resources/tree/leftEndcap.svg";
import endcapR from "../../resources/tree/rightEndcap.svg";
import span from "../../resources/tree/span.svg";
import pillar from "../../resources/tree/pillar.svg";
import teeUp from "../../resources/tree/teeUp.svg";
import teeDown from "../../resources/tree/teeDown.svg";
import intersect from "../../resources/tree/intersect.svg";

const MAX_TILE_WIDTH = 150;
const MIN_TILE_WIDTH = 50;

interface TreeDepictionProps {
  currentDomain: SemanticDomain;
  animate: (domain: SemanticDomain) => void;
}

interface TreeDepictionState {
  tileWidth: number;
}

export default class TreeDepiction extends React.Component<
  TreeDepictionProps,
  TreeDepictionState
> {
  constructor(props: TreeDepictionProps) {
    super(props);
    this.state = { tileWidth: 0 };

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
  updateTileWidth(event?: UIEvent) {
    let tileWidth: number;

    if (this.props.currentDomain.subDomains.length > 0)
      tileWidth = Math.floor(
        document.documentElement.clientWidth /
          (this.props.currentDomain.subDomains.length * 2 - 1)
      );
    else tileWidth = MAX_TILE_WIDTH;
    if (tileWidth < MIN_TILE_WIDTH) tileWidth = MIN_TILE_WIDTH;
    else if (tileWidth > MAX_TILE_WIDTH) tileWidth = MAX_TILE_WIDTH;

    if (Math.floor(this.state.tileWidth) !== Math.floor(tileWidth))
      this.setState({ tileWidth: tileWidth });
  }

  // Renders the parent domain + a dash down to the domain below
  parentDomain(): ReactNode {
    if (this.props.currentDomain.parentDomain)
      return (
        <GridList cols={1}>
          {this.treeTile(pillar)}
          <GridListTile>
            {this.nameTile(this.props.currentDomain.parentDomain)}
          </GridListTile>
        </GridList>
      );
    else return <div />;
  }

  // Renders the subdomains + their connectors to the current domain
  subDomains(): ReactNode {
    let subDomains: SemanticDomain[] = this.props.currentDomain.subDomains;
    if (this.props.currentDomain.subDomains.length > 1)
      return (
        <GridList
          cols={this.props.currentDomain.subDomains.length * 2 - 1} // # of cells across the joist is
          cellHeight={this.state.tileWidth}
          spacing={0}
          style={{
            width:
              (this.props.currentDomain.subDomains.length * 2 - 1) *
              this.state.tileWidth
          }}
        >
          {/* Content */}
          {this.domainRow()}

          {/* Left endcap */}
          {this.treeTile(endcapL)}

          {/* Add tree branch */}
          {this.joistRow()}

          {/* Right endcap */}
          {this.treeTile(endcapR)}
        </GridList>
      );
    else
      return (
        <GridList
          cols={1}
          cellHeight={this.state.tileWidth}
          spacing={0}
          style={{
            width:
              (this.props.currentDomain.subDomains.length * 2 - 1) *
              this.state.tileWidth
          }}
        >
          <GridListTile>{this.nameTile(subDomains[0])}</GridListTile>
          {this.treeTile(pillar)}
        </GridList>
      );
  }

  // Creates the joist connecting current domain with subdomains
  joistRow(): ReactNode[] {
    let row: ReactNode[] = [];
    let middleElement: string;
    let half: number = this.props.currentDomain.subDomains.length - 2;

    // Determine the kind of middle element needed
    if (this.props.currentDomain.subDomains.length % 2 === 0)
      middleElement = teeDown;
    else middleElement = intersect;

    // Add elements on left, then the center, then the right
    this.halfJoist(half, row, true);
    row[half] = this.treeTile(middleElement);
    this.halfJoist(half, row, middleElement === intersect);

    return row;
  }

  // Helper function for joistRow: creates an alternating pattern of tees and spans, based on an initial starting type
  halfJoist(half: number, row: ReactNode[], startWithSpan: boolean) {
    let valForSpan: number = startWithSpan ? 0 : 1;
    for (let count: number = 0; count < half; count++) {
      row.push(this.treeTile(count % 2 === valForSpan ? span : teeUp));
    }
  }

  // Places the actual sub domain tiles
  domainRow(): ReactNode[] {
    let subDomains: ReactNode[] = [];
    let domainIndex: number = 0;

    for (
      let i: number = 0;
      i < this.props.currentDomain.subDomains.length * 2 - 1;
      i++
    ) {
      if (i % 2 === 0) {
        subDomains.push(
          <GridListTile key={domainIndex + "NameTile"}>
            {this.nameTile(this.props.currentDomain.subDomains[domainIndex])}
          </GridListTile>
        );
        domainIndex++;
      } else subDomains.push(<GridListTile key={domainIndex + "DummyTile"} />);
    }
    return subDomains;
  }

  // Creates a semantic domain tile, which (if navigable) can be clicked on to navigate to that semantic domain
  nameTile(domain: SemanticDomain, currentDomain: boolean = true): ReactNode {
    return (
      <Button
        id={domain.number}
        color={"primary"}
        variant={currentDomain ? "contained" : "outlined"}
        disabled={!currentDomain && !this.props.currentDomain.parentDomain}
        style={{
          left: 0,
          top: 0,
          width: "90%",
          height: "90%",
          margin: "5%"
        }}
        onClick={() => {
          this.props.animate(domain);
        }}
      >
        <div>
          <Typography variant={"h5"}>{domain.name}</Typography>
          <Typography variant={"h6"}>{domain.number}</Typography>
        </div>
      </Button>
    );
  }

  // Creates a section of the tree diagram (one of the branches) set to proper dimensions
  treeTile(name: string): ReactNode {
    return (
      <GridListTile key={name + Math.random() * 1000}>
        <img
          src={name}
          alt={name}
          width={this.state.tileWidth}
          height={"100%"}
        />
      </GridListTile>
    );
  }

  render() {
    return (
      <React.Fragment>
        {/* Label next options, if applicable */}
        <Grid item xs>
          {this.props.currentDomain.subDomains.length > 0 && this.subDomains()}
        </Grid>
        <div
          style={{
            marginLeft:
              Math.max(this.props.currentDomain.subDomains.length - 1, 0) *
              this.state.tileWidth
          }}
        >
          {/* Label current domain */}
          <Grid item xs style={{ width: this.state.tileWidth }}>
            {this.nameTile(this.props.currentDomain, false)}
          </Grid>
          {/* Optionally create the header for the parent domain */}
          <Grid item xs style={{ width: this.state.tileWidth }}>
            {this.props.currentDomain.parentDomain && this.parentDomain()}
          </Grid>
        </div>
      </React.Fragment>
    );
  }
}
