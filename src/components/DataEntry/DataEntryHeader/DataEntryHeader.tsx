import { Switch, Typography } from "@material-ui/core";
import { Help } from "@material-ui/icons";
import React from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import { Key } from "ts-key-enum";

import { SemanticDomainFull } from "api/models";
import theme from "types/theme";

("types/semanticDomain");

interface DataEntryHeaderProps extends WithTranslation {
  domain: SemanticDomainFull;
  questionsVisible: boolean;
  setQuestionVisibility: (visibility: boolean) => void;
}

/**
 * Displays information about the current data entry view
 */
export class DataEntryHeader extends React.Component<DataEntryHeaderProps> {
  /*
  TODO: Add state for SemanticDomainFull to this class and use the state
  to set the display. Initially set the state based off the property that
  comes in, but then it will be reset by the following call and update the component
  to the full content.

  getSemanticDomainFull(
    this.props.domain.id,
    this.props.domain.lang
  ).then((fullDomain) => this.setState({ domain: fullDomain }));
*/
  render() {
    const hasQuestions: boolean =
      this.props.domain.questions && this.props.domain.questions.length > 0;
    return (
      <Typography
        variant="h4"
        align="center"
        style={{ marginBottom: theme.spacing(2) }}
      >
        {this.props.t("addWords.domain")}
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
export default withTranslation()(DataEntryHeader);
