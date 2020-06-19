import React from "react";
import { Switch, Typography } from "@material-ui/core";

import { Help } from "@material-ui/icons";
import theme from "../../../types/theme";
import {
  Translate,
  withLocalize,
  LocalizeContextProps,
} from "react-localize-redux";
import DomainTree from "../../../types/SemanticDomain";

interface DataEntryHeaderProps {
  domain: DomainTree;
  questionsVisible: boolean;
  setQuestionVisibility: (visibility: boolean) => void;
}

/**
 * Displays information about the current data entry view
 */
export class DataEntryHeader extends React.Component<
  DataEntryHeaderProps & LocalizeContextProps
> {
  render() {
    let questions;
    const hasQuestions: boolean = this.props.domain.questions.length > 0;
    if (this.props.questionsVisible) {
      questions = this.props.domain.questions.map((q) => (
        <Typography>{q}</Typography>
      ));
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
          id="questionVisibilitySwitch"
          onChange={() =>
            this.props.setQuestionVisibility(!this.props.questionsVisible)
          }
          icon={<Help style={{ fontSize: 21 }} />}
          checkedIcon={<Help style={{ fontSize: 21 }} />}
          checked={this.props.questionsVisible}
          color="primary"
          style={{ paddingTop: "8px" }}
          disabled={!hasQuestions}
        />
        {questions}
      </Typography>
    );
  }
}

export default withLocalize(DataEntryHeader);
