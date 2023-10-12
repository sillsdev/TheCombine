import { Chip } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { SemanticDomain } from "api/models";
import { getUser } from "backend";
import { friendlySep, getDateTimeString } from "utilities/utilities";

interface DomainChipProps {
  domain: SemanticDomain;
  minimal?: boolean;
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

  const text = props.minimal ? id : `${id}: ${name}`;
  const hoverText = props.minimal ? [`${id}: ${name}`] : [];
  if (props.provenance && created) {
    hoverText.push(
      t("wordHistory.domainAdded", {
        val: getDateTimeString(created, friendlySep),
      })
    );
  }
  if (username) {
    hoverText.push(t("wordHistory.user", { val: username }));
  }
  return <Chip label={text} title={hoverText.join("\n")} />;
}
