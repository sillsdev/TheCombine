import React from "react";
import { Typography } from "@material-ui/core";
import theme from "../../../types/theme";
import {
  Translate,
  withLocalize,
  LocalizeContextProps
} from "react-localize-redux";
import DomainTree from "../../TreeView/SemanticDomain";

interface DataEntryHeaderProps {
  domain: DomainTree;
}

/**
 * Displays information about the current data entry view
 */
export class DataEntryHeader extends React.Component<
  DataEntryHeaderProps & LocalizeContextProps
> {
  render() {
    return (
      <Typography
        variant="h4"
        align="center"
        style={{ marginBottom: theme.spacing(2) }}
      >
        <Translate id="addWords.domain" />
        {": "}
        {this.props.domain.name + " (" + this.props.domain.id + ")"}
        <Typography>{this.props.domain.description}</Typography>
      </Typography>
    );
  }
}

export default withLocalize(DataEntryHeader);
