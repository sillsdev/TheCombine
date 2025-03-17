import { Help } from "@mui/icons-material";
import { Switch, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Key } from "ts-key-enum";

import { SemanticDomainFull } from "api/models";
import BidiIcon from "components/BidiIcon";
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

  const switchIcon = (
    <BidiIcon icon={Help} iconProps={{ style: { fontSize: 21 } }} />
  );

  return (
    <Typography
      variant="h4"
      align="center"
      style={{ marginBottom: theme.spacing(2) }}
    >
      {t("addWords.domainTitle", { val1: domain.name, val2: domain.id })}
      <bdi>
        <Typography>{domain.description}</Typography>
      </bdi>
      <Switch
        id="questionVisibilitySwitch"
        onChange={() => props.setQuestionVisibility(!props.questionsVisible)}
        icon={switchIcon}
        checkedIcon={switchIcon}
        checked={props.questionsVisible}
        color="primary"
        style={{ paddingTop: "8px" }}
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
