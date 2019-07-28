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
  notifyOfGettingSemanticDomain: (isGettingSemanticDomain: boolean) => void;
}

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
        <IconButton
          onClick={() => {
            this.props.notifyOfGettingSemanticDomain(true);
          }}
        >
          <Edit />
        </IconButton>
      </Typography>
    );
  }
}

export default withLocalize(DataEntryHeader);
