import React from "react";
import SemanticDomain from "./SemanticDomain";
import { Button, Typography, TextField, Grid } from "@material-ui/core";

interface TreeHeaderProps {
  currentDomain: SemanticDomain;
  animate: (domain: SemanticDomain) => Promise<void>;
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
      input: props.currentDomain.id
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
    if (
      event.key === "Enter" &&
      event.target &&
      (event.target as any).value !== ""
    ) {
      let target: string = (event.target as any).value;

      // Find parent domain
      let parent: SemanticDomain | undefined = this.props.currentDomain;
      while (parent.parentDomain !== undefined) parent = parent.parentDomain;

      // Search for domain
      for (let i: number = 0; i < 4 && parent; i++) {
        parent = this.searchDomain(parent, target.slice(0, i * 2 + 1));
        if (parent && parent.id === target) this.props.animate(parent);
        else if (!parent) break;
      }
    }
  }

  // Navigate tree via arrow keys
  navigateDomainArrowKeys(event: KeyboardEvent) {
    if (event.key === "ArrowLeft") {
      let domain: SemanticDomain | undefined = this.getBrotherDomain(-1);
      if (domain && domain.id !== this.props.currentDomain.id)
        this.props.animate(domain);
    } else if (event.key === "ArrowRight") {
      let domain: SemanticDomain | undefined = this.getBrotherDomain(1);
      if (domain && domain.id !== this.props.currentDomain.id)
        this.props.animate(domain);
    } else if (event.key === "ArrowDown") {
      if (this.props.currentDomain.parentDomain)
        this.props.animate(this.props.currentDomain.parentDomain);
    }
  }

  // Search for a semantic domain by number
  searchDomain(
    parent: SemanticDomain,
    number: string
  ): SemanticDomain | undefined {
    for (let domain of parent.subDomains)
      if (domain.id === number) return domain;

    if (parent.id === number) return parent;
    else return undefined;
  }

  // Switches currentDomain to the domain navigationAmount off from this domain, assuming that domain exists
  navigateDomain(navigationAmount: number) {
    if (this.props.currentDomain.parentDomain) {
      let brotherDomain: SemanticDomain | undefined = this.getBrotherDomain(
        navigationAmount
      );
      if (brotherDomain) this.props.animate(brotherDomain);
    }
  }

  // Gets the domain 'navigationAmount' away from the currentDomain (negative to the left, positive to the right)
  getBrotherDomain(navigationAmount: number): SemanticDomain | undefined {
    if (this.props.currentDomain.parentDomain) {
      let brotherDomains: SemanticDomain[] = this.props.currentDomain
        .parentDomain.subDomains;
      let index: number = brotherDomains.findIndex(
        domain => this.props.currentDomain.id === domain.id
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

  // Creates the two-button + input field input
  render() {
    let domainL: SemanticDomain | undefined = this.getBrotherDomain(-1);
    let domainR: SemanticDomain | undefined = this.getBrotherDomain(1);

    return (
      <Grid container>
        <Grid item style={{ minWidth: "5vw" }}>
          {domainL ? (
            <Button
              variant={"outlined"}
              onClick={() => this.navigateDomain(-1)}
            >
              <Typography variant="h6">
                {"<" + domainL.id.padStart(8, " ")}
              </Typography>
            </Button>
          ) : (
            <div />
          )}
        </Grid>
        <Grid item style={{ minWidth: "10vw" }}>
          <TextField
            fullWidth
            id="name"
            label="Semantic Domain"
            value={this.state.input}
            onKeyUp={this.searchAndSelectDomain}
            onChange={this.handleChange}
            margin="normal"
          />
        </Grid>
        <Grid item style={{ minWidth: "5vw" }}>
          {domainR ? (
            <Button variant={"outlined"} onClick={() => this.navigateDomain(1)}>
              <Typography variant="h6">
                {domainR.id.padEnd(8, " ") + ">"}
              </Typography>
            </Button>
          ) : (
            <div />
          )}
        </Grid>
      </Grid>
    );
  }
}
