import {
  Button,
  Card,
  GridList,
  GridListTile,
  TextField,
  Typography,
} from "@material-ui/core";
import React from "react";
import Bounce from "react-reveal/Bounce";

import SemanticDomainWithSubdomains from "../../types/SemanticDomain";
import DomainTile, { Direction } from "./DomainTile";

interface TreeHeaderProps {
  currentDomain: SemanticDomainWithSubdomains;
  animate: (domain: SemanticDomainWithSubdomains) => Promise<void>;
  bounceState: number;
  bounce: () => void;
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
    this.state = { input: props.currentDomain.id };
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
            this.props.bounce();
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
          this.props.bounce();
          this.setState({ input: "" });
          (event.target as any).value = "";
        }
      }
    }
  }

  // Navigate tree via arrow keys
  navigateDomainArrowKeys(event: KeyboardEvent) {
    if (event.key === "ArrowLeft") {
      const domain = this.getBrotherDomain(-1);
      if (domain && domain.id !== this.props.currentDomain.id)
        this.props.animate(domain);
    } else if (event.key === "ArrowRight") {
      const domain = this.getBrotherDomain(1);
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
      for (const sub of domain.subdomains) {
        tempDomain = this.searchDomainByName(sub, target);
        if (check(tempDomain)) return tempDomain;
      }
    }
  }

  // Switches currentDomain to the domain navigationAmount off from this domain, assuming that domain exists
  navigateDomain(navigationAmount: number) {
    if (this.props.currentDomain.parentDomain) {
      const brotherDomain = this.getBrotherDomain(navigationAmount);
      if (brotherDomain) this.props.animate(brotherDomain);
    }
  }

  // Gets the domain 'navigationAmount' away from the currentDomain (negative to the left, positive to the right)
  getBrotherDomain(
    navigationAmount: number
  ): SemanticDomainWithSubdomains | undefined {
    if (this.props.currentDomain.parentDomain) {
      const brotherDomains = this.props.currentDomain.parentDomain.subdomains;
      let index = brotherDomains.findIndex(
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
    this.setState((_, props) => ({ input: props.currentDomain.id }));
  }

  // Creates the L/R button + select button + search bar
  render() {
    const domainL = this.getBrotherDomain(-1);
    const domainR = this.getBrotherDomain(1);
    return (
      <GridList cols={9} spacing={20} cellHeight={"auto"}>
        <GridListTile cols={2}>
          {domainL ? (
            <DomainTile
              domain={domainL}
              onClick={(e) => {
                this.props.animate(e);
                this.props.bounce();
              }}
              direction={Direction.Left}
            />
          ) : null}
        </GridListTile>
        <GridListTile cols={5}>
          <Card>
            <Bounce spy={this.props.bounceState} duration={2000}>
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
                  <Typography variant="h6">
                    {this.props.currentDomain.name}
                  </Typography>
                </div>
              </Button>
            </Bounce>
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
            <DomainTile
              domain={domainR}
              onClick={(e) => {
                this.props.animate(e);
                this.props.bounce();
              }}
              direction={Direction.Right}
            />
          ) : null}
        </GridListTile>
      </GridList>
    );
  }
}
