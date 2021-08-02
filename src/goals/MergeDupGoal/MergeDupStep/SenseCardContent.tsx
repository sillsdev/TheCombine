import {
  CardContent,
  Chip,
  Grid,
  IconButton,
  Typography,
} from "@material-ui/core";
import { ArrowForwardIos } from "@material-ui/icons";
import React from "react";

import { Sense } from "api/models";
import theme from "types/theme";

interface senseInLanguage {
  language: string; // bcp-47 code
  glossText: string;
  definitionText?: string;
}

function getSenseInLanguage(
  sense: Sense,
  includeDefinitions: boolean,
  language: string,
  displaySep = "; "
): senseInLanguage {
  return {
    language,
    glossText: sense.glosses
      .filter((g) => g.language === language)
      .map((g) => g.def)
      .join(displaySep),
    definitionText: includeDefinitions
      ? sense.definitions
          .filter((d) => d.language === language)
          .map((d) => d.text)
          .join(displaySep)
      : undefined,
  };
}

function getSenseInLanguages(
  sense: Sense,
  includeDefinitions: boolean,
  languages?: string[]
): senseInLanguage[] {
  if (!languages) {
    languages = sense.glosses.map((g) => g.language);
    if (includeDefinitions) {
      languages.push(...sense.definitions.map((d) => d.language));
    }
    languages = [...new Set(languages)];
  }
  return languages.map((l) => getSenseInLanguage(sense, includeDefinitions, l));
}

function senseText(senseInLangs: senseInLanguage[]): JSX.Element {
  return (
    <React.Fragment>
      {senseInLangs.map((sInLang) => (
        <div key={sInLang.language}>
          <Typography variant="caption">{`${sInLang.language}: `}</Typography>
          <Typography
            display="inline"
            variant="h5"
            style={{ marginBottom: theme.spacing(1) }}
          >
            {sInLang.glossText}
          </Typography>
          {!!sInLang.definitionText && (
            <div
              style={{
                marginBottom: theme.spacing(1),
                paddingLeft: theme.spacing(1),
                borderLeft: "1px solid black",
              }}
            >
              <Typography variant="h6" color="textSecondary">
                {sInLang.definitionText}
              </Typography>
            </div>
          )}
        </div>
      ))}
    </React.Fragment>
  );
}

interface SenseCardContentProps {
  senses: Sense[];
  includeDefinitions: boolean;
  languages?: string[];
  toggleFunction?: () => void;
}

// Only show first sense's glosses/definitions; in merging, others deleted as duplicates.
// Show semantic domains from all seneses.
// In merging, user can select a different one by reordering in the sidebar.
export default function SenseCardContent(props: SenseCardContentProps) {
  const senseTextInLangs = getSenseInLanguages(
    props.senses[0],
    props.includeDefinitions,
    props.languages
  );
  const semDoms = [
    ...new Set(
      props.senses.flatMap((s) =>
        s.semanticDomains.map((dom) => `${dom.id}: ${dom.name}`)
      )
    ),
  ];
  return (
    <CardContent style={{ position: "relative", paddingRight: 40 }}>
      {/* Button for showing the sidebar. */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: 0,
          transform: "translateY(-50%)",
        }}
      >
        {props.senses.length > 1 && props.toggleFunction && (
          <IconButton onClick={props.toggleFunction}>
            <ArrowForwardIos />
          </IconButton>
        )}
      </div>
      {/* List glosses and (if enabled) definitions. */}
      {senseText(senseTextInLangs)}
      {/* List semantic domains */}
      <Grid container spacing={2}>
        {semDoms.map((dom) => (
          <Grid item key={dom}>
            <Chip label={dom} />
          </Grid>
        ))}
      </Grid>
    </CardContent>
  );
}
