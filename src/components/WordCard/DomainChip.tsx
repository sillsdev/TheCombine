import { Chip } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { SemanticDomain } from "api/models";
import { getUser } from "backend";
import { friendlySep, getDateTimeString } from "utilities/utilities";

interface DomainChipProps {
  domain: SemanticDomain;
  provenance?: boolean;
}

export default function DomainChip(props: DomainChipProps): ReactElement {
  const { provenance } = props;
  const { created, name, id, userId } = props.domain;

  const [username, setUsername] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    if (provenance && userId) {
      getUser(userId).then((u) => setUsername(u.username));
    }
  }, [provenance, userId]);

  const labelText = `${id}: ${name}`;
  const hoverText = [];
  if (provenance && created) {
    const val = getDateTimeString(created, friendlySep);
    hoverText.push(t("wordHistory.domainAdded", { val }));
  }
  if (provenance && username) {
    hoverText.push(t("wordHistory.user", { val: username }));
  }
  return <Chip label={labelText} title={hoverText.join("\n")} />;
}
