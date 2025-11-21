import { ArrowForwardIos } from "@mui/icons-material";
import { CardContent, IconButton } from "@mui/material";
import { type ReactElement } from "react";

import { GramCatGroup, type Sense, Status } from "api/models";
import PartOfSpeechButton from "components/Buttons/PartOfSpeechButton";
import DomainChipsGrid from "components/WordCard/DomainChipsGrid";
import SenseCardText from "components/WordCard/SenseCardText";
import ProtectedWarningIcon from "goals/MergeDuplicates/MergeDupsStep/ProtectedWarningIcon";
import { combineSenses } from "goals/MergeDuplicates/Redux/reducerUtilities";

interface SenseCardContentProps {
  senses: Sense[];
  isCompleted?: boolean;
  languages?: string[];
  sidebar?: boolean;
  toggleFunction?: () => void;
}

/** Combine content from all senses. */
export default function SenseCardContent(
  props: SenseCardContentProps
): ReactElement {
  const sense = combineSenses(props.senses);
  const gramInfo =
    sense.grammaticalInfo.catGroup === GramCatGroup.Unspecified
      ? undefined
      : sense.grammaticalInfo;
  const semDoms = sense.semanticDomains.sort((a, b) =>
    a.id.localeCompare(b.id)
  );

  return (
    <CardContent style={{ paddingInlineEnd: 40, position: "relative" }}>
      {/* Icon for part of speech (if any). */}
      <div style={{ insetInlineStart: 0, position: "absolute", top: 0 }}>
        {gramInfo && (
          <PartOfSpeechButton
            buttonId={`sense-${sense.guid}-part-of-speech`}
            gramInfo={gramInfo}
            onlyIcon
          />
        )}
      </div>
      {/* Warning for protected senses. */}
      <div style={{ insetInlineEnd: 0, position: "absolute", top: 0 }}>
        {!props.sidebar && sense.accessibility === Status.Protected && (
          <ProtectedWarningIcon
            id={sense.guid}
            isCompleted={props.isCompleted}
            protectReasons={sense.protectReasons}
            senseOrWord="sense"
          />
        )}
      </div>
      {/* Button for showing the sidebar, when sense card has multiple senses. */}
      <div
        style={{
          insetInlineEnd: 0,
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        {props.senses.length > 1 && (
          <IconButton
            onClick={props.toggleFunction}
            id={`sidebar-open-sense-${sense.guid}`}
            size="large"
          >
            <ArrowForwardIos />
          </IconButton>
        )}
      </div>
      {/* List glosses and (if any) definitions. */}
      <SenseCardText languages={props.languages} sense={sense} />
      {/* List semantic domains. */}
      <DomainChipsGrid semDoms={semDoms} />
    </CardContent>
  );
}
