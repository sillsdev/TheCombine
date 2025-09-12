import { Help } from "@mui/icons-material";
import { Switch, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Key } from "ts-key-enum";

import { SemanticDomainFull } from "api/models";

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
    <Typography align="center" variant="h4">
      {t("addWords.domainTitle", { val1: domain.name, val2: domain.id })}
      <bdi>
        <Typography>{domain.description}</Typography>
      </bdi>
      <Switch
        id="questionVisibilitySwitch"
        onChange={() => props.setQuestionVisibility(!props.questionsVisible)}
        icon={<Help sx={{ fontSize: 19 }} />}
        checkedIcon={<Help sx={{ fontSize: 19 }} />}
        checked={props.questionsVisible}
        color="primary"
        sx={{ pt: "11px" }}
        disabled={!domain.questions.length}
        onKeyDown={(e) => {
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
    <bdi>
      {props.questions.map((question, index) => (
        <Typography id={"q" + index} key={index}>
          {question}
        </Typography>
      ))}
    </bdi>
  );
}
