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
  const [username, setUsername] = useState("");
  const { t } = useTranslation();
  const provenance = props.provenance;
  const { created, name, id, userId } = props.domain;

  useEffect(() => {
    if (provenance && userId) {
      getUser(userId).then((u) => setUsername(u.username));
    }
  }, [provenance, userId]);

  const text = `${id}: ${name}`;
  const provenanceText: string[] = [];
  if (props.provenance && created) {
    provenanceText.push(
      t("wordHistory.domainAdded", {
        val: getDateTimeString(created, friendlySep),
      })
    );
  }
  if (username) {
    provenanceText.push(t("wordHistory.user", { val: username }));
  }
  return <Chip label={text} title={provenanceText.join("\n")} />;
}
