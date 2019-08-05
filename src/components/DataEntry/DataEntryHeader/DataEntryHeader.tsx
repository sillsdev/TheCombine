import React from "react";
import { Typography, IconButton } from "@material-ui/core";
import { Edit } from "@material-ui/icons";
import theme from "../../../types/theme";
import {
  Translate,
  withLocalize,
  LocalizeContextProps
} from "react-localize-redux";
import DomainTree from "../../TreeView/SemanticDomain";

interface DataEntryHeaderProps {
  domain: DomainTree;
  displaySemanticDomainView: (isGettingSemanticDomain: boolean) => void;
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
        <IconButton
          onClick={() => {
            this.props.displaySemanticDomainView(true);
          }}
        >
          <Edit />
        </IconButton>
      </Typography>
    );
  }
}

export default withLocalize(DataEntryHeader);
