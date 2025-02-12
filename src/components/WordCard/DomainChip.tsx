import { Chip } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { SemanticDomain } from "api/models";
import { getUser } from "backend";
import { friendlySep, getDateTimeString } from "utilities/utilities";

export function domainLabel(domain: SemanticDomain): string {
  return `${domain.id}: ${domain.name}`;
}

interface DomainChipProps {
  domain: SemanticDomain;
  provenance?: boolean;
}

export default function DomainChip(props: DomainChipProps): ReactElement {
  const { provenance } = props;
  const { created, userId } = props.domain;

  const [username, setUsername] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    if (provenance && userId) {
      getUser(userId).then((u) => setUsername(u.username));
    }
  }, [provenance, userId]);

  const hoverText = [];
  if (provenance && created) {
    const val = getDateTimeString(created, friendlySep);
    hoverText.push(t("wordCard.domainAdded", { val }));
  }
  if (provenance && username) {
    hoverText.push(t("wordCard.user", { val: username }));
  }
  return (
    <Chip label={domainLabel(props.domain)} title={hoverText.join("\n")} />
  );
}
