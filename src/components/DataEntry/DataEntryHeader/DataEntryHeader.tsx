import { Help } from "@mui/icons-material";
import { Switch, Typography } from "@mui/material";
import React, { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Key } from "ts-key-enum";

import { SemanticDomainFull } from "api/models";
import theme from "types/theme";

interface DataEntryHeaderProps {
  domain: SemanticDomainFull;
  questionsVisible: boolean;
  setQuestionVisibility: (visibility: boolean) => void;
}

/**
 * Displays information about the current data entry view
 */
export default function DataEntryHeader(
  props: DataEntryHeaderProps
): ReactElement {
  const domain = props.domain;
  const { t } = useTranslation();

  return (
    <Typography
      variant="h4"
      align="center"
      style={{ marginBottom: theme.spacing(2) }}
    >
      {t("addWords.domainTitle", { val1: domain.name, val2: domain.id })}
      <Typography>{domain.description}</Typography>
      <Switch
        id="questionVisibilitySwitch"
        onChange={() => props.setQuestionVisibility(!props.questionsVisible)}
        icon={<Help style={{ fontSize: 21 }} />}
        checkedIcon={<Help style={{ fontSize: 21 }} />}
        checked={props.questionsVisible}
        color="primary"
        style={{ paddingTop: "8px" }}
        disabled={!domain.questions.length}
        onKeyPress={(e) => {
          if (e.key === Key.Enter) {
            props.setQuestionVisibility(!props.questionsVisible);
          }
        }}
      />
      {props.questionsVisible && <Questions questions={domain.questions} />}
    </Typography>
  );
}

function Questions(props: { questions: string[] }): ReactElement {
  return (
    <React.Fragment>
      {props.questions.map((question, index) => (
        <Typography id={"q" + index} key={index}>
          {question}
        </Typography>
      ))}
    </React.Fragment>
  );
}
