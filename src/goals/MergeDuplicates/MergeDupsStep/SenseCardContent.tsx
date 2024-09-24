import { ArrowForwardIos, WarningOutlined } from "@mui/icons-material";
import { CardContent, IconButton } from "@mui/material";
import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";

import {
  GramCatGroup,
  type ProtectReason,
  ReasonType,
  type Sense,
  Status,
} from "api/models";
import { IconButtonWithTooltip, PartOfSpeechButton } from "components/Buttons";
import MultilineTooltipTitle from "components/MultilineTooltipTitle";
import DomainChipsGrid from "components/WordCard/DomainChipsGrid";
import SenseCardText from "components/WordCard/SenseCardText";
import { combineSenses } from "goals/MergeDuplicates/Redux/reducerUtilities";

interface SenseCardContentProps {
  senses: Sense[];
  languages?: string[];
  sidebar?: boolean;
  toggleFunction?: () => void;
}

/** Only show first sense's glosses, definitions, and part of speech.
 * In merging, others deleted as duplicates;
 * user can select a different first sense by reordering in the sidebar.
 * Show semantic domains from all senses. */
export default function SenseCardContent(
  props: SenseCardContentProps
): ReactElement {
  const { t } = useTranslation();

  const sense = combineSenses(props.senses);
  const gramInfo =
    sense.grammaticalInfo.catGroup === GramCatGroup.Unspecified
      ? undefined
      : sense.grammaticalInfo;
  const semDoms = sense.semanticDomains.sort((a, b) =>
    a.id.localeCompare(b.id)
  );

  const reasonText = (reason: ProtectReason): string => {
    // Backend/Helper/LiftHelper.cs > GetProtectedReasons(LiftSense sense)
    switch (reason.type) {
      case ReasonType.Annotations:
        return t("mergeDups.protectReason.annotations");
      case ReasonType.Examples:
        return t("mergeDups.protectReason.examples");
      case ReasonType.Field:
        return t("mergeDups.protectReason.field", { val: reason.value });
      case ReasonType.GramInfoTrait:
        return t("mergeDups.protectReason.gramInfoTrait", {
          val: reason.value,
        });
      case ReasonType.Illustrations:
        return t("mergeDups.protectReason.illustrations");
      case ReasonType.Notes:
        return t("mergeDups.protectReason.notesSense");
      case ReasonType.Relations:
        return t("mergeDups.protectReason.relations");
      case ReasonType.Reversals:
        return t("mergeDups.protectReason.reversal", { val: reason.value });
      case ReasonType.Subsenses:
        return t("mergeDups.protectReason.subsenses");
      case ReasonType.Trait:
        return reason.value ?? "(unknown trait)";
      case ReasonType.TraitAnthroCode:
        return t("mergeDups.protectReason.traitAnthroCode", {
          val: reason.value,
        });
      case ReasonType.TraitDomainType:
        return t("mergeDups.protectReason.traitDomainType", {
          val: reason.value,
        });
      case ReasonType.TraitDoNotPublishIn:
        return t("mergeDups.protectReason.traitDoNotPublishIn", {
          val: reason.value,
        });
      case ReasonType.TraitPublishIn:
        return t("mergeDups.protectReason.traitPublishIn", {
          val: reason.value,
        });
      case ReasonType.TraitSenseType:
        return t("mergeDups.protectReason.traitSenseType", {
          val: reason.value,
        });
      case ReasonType.TraitStatus:
        return t("mergeDups.protectReason.traitStatus", { val: reason.value });
      case ReasonType.TraitUsageType:
        return t("mergeDups.protectReason.traitUsageType", {
          val: reason.value,
        });
      default:
        throw new Error();
    }
  };

  const protectedWarning =
    !props.sidebar && sense.accessibility === Status.Protected;
  const tooltipTexts = [t("mergeDups.helpText.protectedSense")];
  const reasons = sense.protectReasons;
  if (reasons?.length) {
    tooltipTexts.push(
      t("mergeDups.helpText.protectedData", {
        val: reasons.map(reasonText).join("; "),
      })
    );
  }
  tooltipTexts.push(t("mergeDups.helpText.protectedSenseInfo"));

  return (
    <CardContent style={{ position: "relative", paddingRight: 40 }}>
      {/* Icon for part of speech (if any). */}
      <div style={{ position: "absolute", left: 0, top: 0 }}>
        {gramInfo && (
          <PartOfSpeechButton
            buttonId={`sense-${sense.guid}-part-of-speech`}
            gramInfo={gramInfo}
            onlyIcon
          />
        )}
      </div>
      {/* Warning for protected senses. */}
      <div style={{ position: "absolute", right: 0, top: 0 }}>
        {protectedWarning && (
          <IconButtonWithTooltip
            icon={<WarningOutlined />}
            side="top"
            size="small"
            text={<MultilineTooltipTitle lines={tooltipTexts} />}
            buttonId={`sense-${sense.guid}-protected`}
          />
        )}
      </div>
      {/* Button for showing the sidebar, when sense card has multiple senses. */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: 0,
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
