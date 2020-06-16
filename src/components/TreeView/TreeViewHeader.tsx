import React from "react";
import {
  Button,
  Typography,
  TextField,
  Grid,
  GridList,
  GridListTile,
  Card,
} from "@material-ui/core";
import { ChevronLeft, ChevronRight } from "@material-ui/icons";

import SemanticDomainWithSubdomains from "./SemanticDomain";

interface TreeHeaderProps {
  currentDomain: SemanticDomainWithSubdomains;
  animate: (domain: SemanticDomainWithSubdomains) => Promise<void>;
}

interface TreeHeaderState {
  input: string;
}

export default class TreeViewHeader extends React.Component<
  TreeHeaderProps,
  TreeHeaderState
> {
  animating: boolean;

  constructor(props: TreeHeaderProps) {
    super(props);
    this.state = {
      input: props.currentDomain.id,
    };

    this.animating = false;

    this.searchAndSelectDomain = this.searchAndSelectDomain.bind(this);
    this.navigateDomainArrowKeys = this.navigateDomainArrowKeys.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.updateDomain = this.updateDomain.bind(this);
  }

  componentDidMount() {
    window.addEventListener("keydown", this.navigateDomainArrowKeys);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.navigateDomainArrowKeys);
  }

  // Change the input on typing
  handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    this.setState({ input: event.target.value });
  }

  // Dispatch the search for a specified domain, and switches to it if it exists
  searchAndSelectDomain(event: React.KeyboardEvent) {
    event.bubbles = false;
    event.preventDefault();

    if (event.key === "Enter") {
      // Find parent domain
      let parent: SemanticDomainWithSubdomains | undefined = this.props
        .currentDomain;
      while (parent.parentDomain !== undefined) parent = parent.parentDomain;

      // Search for domain
      if (!isNaN(parseInt(this.state.input))) {
        let i: number = 0;
        while (parent) {
          parent = this.searchDomainByNumber(
            parent,
            this.state.input.slice(0, i * 2 + 1)
          );
          if (parent && parent.id === this.state.input) {
            this.props.animate(parent);
            this.setState({ input: "" });
            (event.target as any).value = "";
            break;
          } else if (parent && parent.subdomains.length === 0) {
            break;
          }
          i++;
        }
      } else {
        parent = this.searchDomainByName(parent, this.state.input);
        if (parent) {
          this.props.animate(parent);
          this.setState({ input: "" });
          (event.target as any).value = "";
        }
      }
    }
  }

  // Navigate tree via arrow keys
  navigateDomainArrowKeys(event: KeyboardEvent) {
    if (event.key === "ArrowLeft") {
      let domain:
        | SemanticDomainWithSubdomains
        | undefined = this.getBrotherDomain(-1);
      if (domain && domain.id !== this.props.currentDomain.id)
        this.props.animate(domain);
    } else if (event.key === "ArrowRight") {
      let domain:
        | SemanticDomainWithSubdomains
        | undefined = this.getBrotherDomain(1);
      if (domain && domain.id !== this.props.currentDomain.id)
        this.props.animate(domain);
    } else if (event.key === "ArrowDown") {
      if (this.props.currentDomain.parentDomain)
        this.props.animate(this.props.currentDomain.parentDomain);
    }
  }

  // Search for a semantic domain by number
  searchDomainByNumber(
    parent: SemanticDomainWithSubdomains,
    number: string
  ): SemanticDomainWithSubdomains | undefined {
    for (let domain of parent.subdomains)
      if (domain.id === number) return domain;

    if (parent.id === number) return parent;
    else return undefined;
  }

  // Searches for a semantic domain by name
  searchDomainByName(
    domain: SemanticDomainWithSubdomains,
    target: string
  ): SemanticDomainWithSubdomains | undefined {
    let check = (checkAgainst: SemanticDomainWithSubdomains | undefined) =>
      checkAgainst && target.toLowerCase() === checkAgainst.name.toLowerCase();
    if (check(domain)) return domain;

    // If there are subdomains
    if (domain.subdomains.length > 0) {
      let tempDomain: SemanticDomainWithSubdomains | undefined;
      for (let sub of domain.subdomains) {
        tempDomain = this.searchDomainByName(sub, target);
        if (check(tempDomain)) return tempDomain;
      }
    }
  }

  // Switches currentDomain to the domain navigationAmount off from this domain, assuming that domain exists
  navigateDomain(navigationAmount: number) {
    if (this.props.currentDomain.parentDomain) {
      let brotherDomain:
        | SemanticDomainWithSubdomains
        | undefined = this.getBrotherDomain(navigationAmount);
      if (brotherDomain) this.props.animate(brotherDomain);
    }
  }

  // Gets the domain 'navigationAmount' away from the currentDomain (negative to the left, positive to the right)
  getBrotherDomain(
    navigationAmount: number
  ): SemanticDomainWithSubdomains | undefined {
    if (this.props.currentDomain.parentDomain) {
      let brotherDomains: SemanticDomainWithSubdomains[] = this.props
        .currentDomain.parentDomain.subdomains;
      let index: number = brotherDomains.findIndex(
        (domain) => this.props.currentDomain.id === domain.id
      );

      index += navigationAmount;
      if (0 <= index && index < brotherDomains.length)
        return brotherDomains[index];
    }

    // No brother domain navigationAmount over from currentDomain
    return undefined;
  }

  // Switches current semantic domain + updates search bar
  updateDomain() {
    this.setState({ input: this.props.currentDomain.id });
  }

  // Creates the L/R button + select button + search bar
  render() {
    let domainL: SemanticDomainWithSubdomains
      | undefined = this.getBrotherDomain(-1);
    let domainR: SemanticDomainWithSubdomains
      | undefined = this.getBrotherDomain(1);

    return (
      <GridList cols={7} spacing={2} cellHeight={"auto"}>
        <GridListTile cols={2}>
          {domainL ? (
            <Grid container justify="center">
              <Button
                variant={"outlined"}
                onClick={() => this.navigateDomain(-1)}
                style={{ float: "right", marginTop: "50%" }}
              >
                <ChevronLeft />
                <Typography variant="body2">
                  {domainL.id.padStart(8, " ")}
                </Typography>
              </Button>
            </Grid>
          ) : null}
        </GridListTile>
        <GridListTile cols={3}>
          <Card>
            <Button
              fullWidth
              size="large"
              color="primary"
              variant="contained"
              disabled={!this.props.currentDomain.parentDomain}
              onClick={() => this.props.animate(this.props.currentDomain)}
            >
              <div style={{ textTransform: "capitalize" }}>
                <Typography variant="overline">
                  {this.props.currentDomain.id}
                </Typography>
                <Typography variant="h5">
                  {this.props.currentDomain.name}
                </Typography>
              </div>
            </Button>
            <TextField
              fullWidth
              id="name"
              label="Find a domain"
              onKeyUp={this.searchAndSelectDomain}
              onChange={this.handleChange}
              margin="normal"
              autoComplete="off"
            />
          </Card>
        </GridListTile>
        <GridListTile cols={2}>
          {domainR ? (
            <Grid container justify="center">
              <Button
                variant={"outlined"}
                onClick={() => this.navigateDomain(1)}
                style={{ marginTop: "50%" }}
              >
                <Typography variant="overline">
                  {domainR.id.padEnd(8, " ")}
                </Typography>
                <Typography variant="h6">
                  {domainR.name.padEnd(8, " ")}
                </Typography>
                <ChevronRight />
              </Button>
            </Grid>
          ) : null}
        </GridListTile>
      </GridList>
    );
  }
}
