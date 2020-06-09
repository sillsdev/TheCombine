import React from "react";
import { Switch, Typography } from "@material-ui/core";
import { createMuiTheme } from "@material-ui/core/styles";
import { Help } from "@material-ui/icons";
import theme, { buttonSuccess } from "../../../types/theme";
import {
  Translate,
  withLocalize,
  LocalizeContextProps,
} from "react-localize-redux";
import DomainTree from "../../TreeView/SemanticDomain";

interface DataEntryHeaderProps {
  domain: DomainTree;
}

interface DataEntryHeaderState {
  questionsVisible: boolean;
}

/**
 * Displays information about the current data entry view
 */
export class DataEntryHeader extends React.Component<
  DataEntryHeaderProps & LocalizeContextProps,
  DataEntryHeaderState
> {
  constructor(props: DataEntryHeaderProps & LocalizeContextProps) {
    super(props);
    this.state = {
      questionsVisible: false,
    };
  }
  render() {
    let questions;
    if (this.state.questionsVisible) {
      questions = (
        <Typography>Questions will go here eventually</Typography>
      ); /*= this.props.domain.questions.map((q) => (
        <Typography>{q}</Typography>
      ));*/
    }
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
        <Switch
          onChange={() => {
            this.setState({ questionsVisible: !this.state.questionsVisible });
          }}
          icon={<Help />}
          checkedIcon={<Help />}
        />
        {questions}
      </Typography>
    );
  }
}

export default withLocalize(DataEntryHeader);
