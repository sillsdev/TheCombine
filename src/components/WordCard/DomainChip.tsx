import { Chip } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { SemanticDomain } from "api/models";
import { getUser } from "backend";
import { getLocalizedDateTimeString } from "utilities/utilities";

export function domainLabel(domain: SemanticDomain): string {
  return `${domain.id}: ${domain.name}`;
}

interface DomainChipProps {
  domain: SemanticDomain;
  onlyId?: boolean;
  provenance?: boolean;
}

export default function DomainChip(props: DomainChipProps): ReactElement {
  const { domain, onlyId, provenance } = props;
  const { created, id, userId } = domain;

  const [username, setUsername] = useState("");
  const { i18n, t } = useTranslation();

  useEffect(() => {
    if (provenance && userId) {
      getUser(userId).then((u) => setUsername(u.username));
    }
  }, [provenance, userId]);

  const hoverText = [];
  if (onlyId) {
    hoverText.push(domainLabel(domain));
  }
  if (provenance && created) {
    const val = getLocalizedDateTimeString(created, i18n.resolvedLanguage);
    hoverText.push(t("wordCard.domainAdded", { val }));
  }
  if (provenance && username) {
    hoverText.push(t("wordCard.user", { val: username }));
  }
  return (
    <Chip
      label={onlyId ? id : domainLabel(domain)}
      title={hoverText.join("\n")}
    />
  );
}
