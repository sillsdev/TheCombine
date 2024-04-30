import { Stack, Typography } from "@mui/material";
import { type ReactElement, useEffect, useState } from "react";
//import { useTranslation } from "react-i18next";

import { type SemanticDomainFull } from "api";
import { type ProjectSettingProps } from "components/ProjectSettings/ProjectSettingsTypes";

interface GroupedDomain {
  [language: string]: SemanticDomainFull;
}

interface GroupedDomains {
  [id: string]: GroupedDomain;
}

function groupDomains(domains: SemanticDomainFull[]): GroupedDomains {
  const groups: GroupedDomains = {};
  domains.forEach((d) => {
    if (!(d.id in groups)) {
      groups[d.id] = {};
    }
    groups[d.id][d.lang] = d;
  });
  return groups;
}

export default function ProjectDomains(
  props: ProjectSettingProps
): ReactElement {
  const [domains, setDomains] = useState<GroupedDomains>({});
  //const { t } = useTranslation();

  useEffect(() => {
    setDomains(groupDomains(props.project.semanticDomains));
  }, [props.project.semanticDomains]);

  return (
    <Stack spacing={1}>
      {Object.keys(domains)
        .sort()
        .map((id) => (
          <CustomDomain domain={domains[id]} id={id} key={id} />
        ))}
    </Stack>
  );
}

interface CustomDomainProps {
  domain: GroupedDomain;
  id: string;
}

function CustomDomain(props: CustomDomainProps): ReactElement {
  return (
    <>
      <Typography>{props.id}</Typography>
    </>
  );
}
