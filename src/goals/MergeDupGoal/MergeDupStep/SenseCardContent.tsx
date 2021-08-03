import {
  CardContent,
  Chip,
  Grid,
  IconButton,
  Table,
  TableCell,
  TableRow,
  Typography,
} from "@material-ui/core";
import { ArrowForwardIos } from "@material-ui/icons";
import React from "react";
import { useSelector } from "react-redux";

import { Sense } from "api/models";
import { StoreState } from "types";
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
    <Table padding="none">
      {senseInLangs.map((sInLang) => (
        <React.Fragment>
          <TableRow key={sInLang.language}>
            <TableCell style={{ borderBottom: "none" }}>
              <Typography variant="caption">{`${sInLang.language}: `}</Typography>
            </TableCell>
            <TableCell style={{ borderBottom: "none" }}>
              <Typography
                //display="inline"
                variant="h5"
                style={{ marginBottom: theme.spacing(1) }}
              >
                {sInLang.glossText}
              </Typography>
            </TableCell>
          </TableRow>
          {!!sInLang.definitionText && (
            <TableRow key={sInLang.language + "def"}>
              <TableCell style={{ borderBottom: "none" }}></TableCell>
              <TableCell style={{ borderBottom: "none" }}>
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
              </TableCell>
            </TableRow>
          )}
        </React.Fragment>
      ))}
    </Table>
  );
}

interface SenseCardContentProps {
  senses: Sense[];
  languages?: string[];
  toggleFunction?: () => void;
}

// Only show first sense's glosses/definitions; in merging, others deleted as duplicates.
// Show semantic domains from all seneses.
// In merging, user can select a different one by reordering in the sidebar.
export default function SenseCardContent(props: SenseCardContentProps) {
  const showDefinitions = useSelector(
    (state: StoreState) => state.currentProjectState.project.definitionsEnabled
  );
  const senseTextInLangs = getSenseInLanguages(
    props.senses[0],
    showDefinitions,
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
      {/* Optional button for showing the sidebar. */}
      {props.senses.length > 1 && props.toggleFunction && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: 0,
            transform: "translateY(-50%)",
          }}
        >
          <IconButton onClick={props.toggleFunction}>
            <ArrowForwardIos />
          </IconButton>
        </div>
      )}
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
