import React from "react";
import { Switch, Typography } from "@material-ui/core";
import { Help } from "@material-ui/icons";
import {
  Translate,
  withLocalize,
  LocalizeContextProps,
} from "react-localize-redux";
import { Key } from "ts-key-enum";

import TreeSemanticDomain from "components/TreeView/TreeSemanticDomain";
import theme from "types/theme";

interface DataEntryHeaderProps {
  domain: TreeSemanticDomain;
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
    const hasQuestions: boolean =
      this.props.domain.questions && this.props.domain.questions.length > 0;
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
          onKeyPress={(e) => {
            if (e.key === Key.Enter) {
              this.props.setQuestionVisibility(!this.props.questionsVisible);
            }
          }}
        />
        {getQuestions(this.props.questionsVisible, this.props.domain.questions)}
      </Typography>
    );
  }
}
export function getQuestions(questionsVisible: boolean, questions: string[]) {
  if (questionsVisible) {
    return questions.map((question, index) => (
      <Typography id={"q" + index} key={index}>
        {question}
      </Typography>
    ));
  }
}
export default withLocalize(DataEntryHeader);
