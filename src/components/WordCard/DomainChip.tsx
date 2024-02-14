import { Chip } from "@mui/material";
import { type ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { type SemanticDomain } from "api/models";
import { getUser } from "backend";
import { type StoreState } from "types";
import { useAppSelector } from "types/hooks";
import { friendlySep, getDateTimeString } from "utilities/utilities";

interface DomainChipProps {
  domain: SemanticDomain;
  provenance?: boolean;
}

export default function DomainChip(props: DomainChipProps): ReactElement {
  const { provenance } = props;
  const { created, name, id, userId } = props.domain;

  const semDomName = useAppSelector((state: StoreState) => {
    const semDoms = state.currentProjectState.semanticDomains;
    return semDoms ? semDoms[id] ?? name : name;
  });
  const [username, setUsername] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    if (provenance && userId) {
      getUser(userId).then((u) => setUsername(u.username));
    }
  }, [provenance, userId]);

  const labelText = `${id}: ${semDomName}`;
  const hoverText = [];
  if (provenance && created) {
    const val = getDateTimeString(created, friendlySep);
    hoverText.push(t("wordCard.domainAdded", { val }));
  }
  if (provenance && username) {
    hoverText.push(t("wordCard.user", { val: username }));
  }
  return <Chip label={labelText} title={hoverText.join("\n")} />;
}
