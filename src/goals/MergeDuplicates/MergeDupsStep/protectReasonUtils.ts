import { TFunction } from "i18next";

import { ProtectReason, ReasonType } from "api/models";

const sep = "; ";

export function protectReasonsText(
  t: TFunction<"translation", undefined>,
  wordReasons: ProtectReason[],
  senseReasons: ProtectReason[]
): string {
  const wordTexts = wordReasons.map((r) => wordReasonText(t, r));
  const senseTexts = senseReasons.map((r) => senseReasonText(t, r));
  return t("mergeDups.helpText.protectedData", {
    val: [...wordTexts, ...senseTexts].join(sep),
  });
}

/** Cases match Backend/Helper/LiftHelper.cs > GetProtectedReasons(LiftSense sense) */
function senseReasonText(
  t: TFunction<"translation", undefined>,
  reason: ProtectReason
): string {
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
}

/** Cases match Backend/Helper/LiftHelper.cs > GetProtectedReasons(LiftEntry entry) */
function wordReasonText(
  t: TFunction<"translation", undefined>,
  reason: ProtectReason
): string {
  switch (reason.type) {
    case ReasonType.Annotations:
      return t("mergeDups.protectReason.annotations");
    case ReasonType.Etymologies:
      return t("mergeDups.protectReason.etymologies");
    case ReasonType.Field:
      return t("mergeDups.protectReason.field", { val: reason.value });
    case ReasonType.NoteWithType:
      return t("mergeDups.protectReason.noteWithType", { val: reason.value });
    case ReasonType.Notes:
      return t("mergeDups.protectReason.notesWord");
    case ReasonType.Relations:
      return t("mergeDups.protectReason.relations");
    case ReasonType.Trait:
      return reason.value ?? "(unknown trait)";
    case ReasonType.TraitDialectLabels:
      return t("mergeDups.protectReason.traitDialectLabels", {
        val: reason.value,
      });
    case ReasonType.TraitDoNotPublishIn:
      return t("mergeDups.protectReason.traitDoNotPublishIn", {
        val: reason.value,
      });
    case ReasonType.TraitDoNotUseForParsing:
      return t("mergeDups.protectReason.traitDoNotUseForParsing", {
        val: reason.value,
      });
    case ReasonType.TraitEntryType:
      return t("mergeDups.protectReason.traitEntryType", {
        val: reason.value,
      });
    case ReasonType.TraitExcludeAsHeadword:
      return t("mergeDups.protectReason.traitExcludeAsHeadword");
    case ReasonType.TraitMinorEntryCondition:
      return t("mergeDups.protectReason.traitMinorEntryCondition", {
        val: reason.value,
      });
    case ReasonType.TraitMorphType:
      return t("mergeDups.protectReason.traitMorphType", {
        val: reason.value,
      });
    case ReasonType.TraitPublishIn:
      return t("mergeDups.protectReason.traitPublishIn", {
        val: reason.value,
      });
    case ReasonType.Variants:
      return t("mergeDups.protectReason.variants");
    default:
      throw new Error();
  }
}
