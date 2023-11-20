import { ArrowForwardIos, WarningOutlined } from "@mui/icons-material";
import {
  CardContent,
  Chip,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { ReactElement } from "react";

import { GramCatGroup, Sense, Status } from "api/models";
import { IconButtonWithTooltip, PartOfSpeechButton } from "components/Buttons";
import theme from "types/theme";
import { TypographyWithFont } from "utilities/fontComponents";

interface SenseInLanguage {
  language: string; // bcp-47 code
  glossText: string;
  definitionText?: string;
}

function getSenseInLanguage(
  sense: Sense,
  language: string,
  displaySep = "; "
): SenseInLanguage {
  return {
    language,
    glossText: sense.glosses
      .filter((g) => g.language === language)
      .map((g) => g.def)
      .join(displaySep),
    definitionText: sense.definitions.length
      ? sense.definitions
          .filter((d) => d.language === language)
          .map((d) => d.text)
          .join(displaySep)
      : undefined,
  };
}

function getSenseInLanguages(
  sense: Sense,
  languages?: string[]
): SenseInLanguage[] {
  if (!languages) {
    languages = sense.glosses.map((g) => g.language);
    languages.push(...sense.definitions.map((d) => d.language));
    languages = [...new Set(languages)];
  }
  return languages.map((l) => getSenseInLanguage(sense, l));
}

interface SenseTextRowsProps {
  senseInLang: SenseInLanguage;
}

function SenseTextRows(props: SenseTextRowsProps): ReactElement {
  const lang = props.senseInLang.language;
  return (
    <>
      <TableRow key={lang}>
        <TableCell style={{ borderBottom: "none" }}>
          <Typography variant="caption">
            {lang}
            {":"}
          </Typography>
        </TableCell>
        <TableCell style={{ borderBottom: "none" }}>
          <TypographyWithFont
            lang={lang}
            style={{ marginBottom: theme.spacing(1) }}
            variant="h5"
          >
            {props.senseInLang.glossText}
          </TypographyWithFont>
        </TableCell>
      </TableRow>
      {!!props.senseInLang.definitionText && (
        <TableRow key={lang + "def"}>
          <TableCell style={{ borderBottom: "none" }} />
          <TableCell style={{ borderBottom: "none" }}>
            <div
              style={{
                borderLeft: "1px solid black",
                marginBottom: theme.spacing(1),
                paddingLeft: theme.spacing(1),
              }}
            >
              <TypographyWithFont
                color="textSecondary"
                lang={lang}
                variant="h6"
              >
                {props.senseInLang.definitionText}
              </TypographyWithFont>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

interface SenseCardContentProps {
  senses: Sense[];
  languages?: string[];
  sidebar?: boolean;
  toggleFunction?: () => void;
}

// Only show first sense's glosses/definitions; in merging, others deleted as duplicates.
// Show first part of speech, if any.
// Show semantic domains from all senses.
// In merging, user can select a different one by reordering in the sidebar.
export default function SenseCardContent(
  props: SenseCardContentProps
): ReactElement {
  const senseTextInLangs = getSenseInLanguages(
    props.senses[0],
    props.languages
  );
  const semDoms = [
    ...new Set(
      props.senses.flatMap((s) =>
        s.semanticDomains.map((dom) => `${dom.id}: ${dom.name}`)
      )
    ),
  ];
  const protectedWarning =
    !props.sidebar && props.senses[0].accessibility === Status.Protected;
  const gramInfo = props.senses
    .map((s) => s.grammaticalInfo)
    .find((g) => g.catGroup !== GramCatGroup.Unspecified);

  return (
    <CardContent style={{ position: "relative", paddingRight: 40 }}>
      {/* Icon for part of speech (if any). */}
      <div style={{ position: "absolute", left: 0, top: 0 }}>
        {gramInfo && (
          <PartOfSpeechButton
            buttonId={`sense-${props.senses[0].guid}-part-of-speech`}
            gramInfo={gramInfo}
            onlyIcon
          />
        )}
      </div>
      {/* Warning for protected senses. */}
      <div style={{ position: "absolute", right: 0, top: 0 }}>
        {protectedWarning && (
          <IconButtonWithTooltip
            icon={<WarningOutlined />}
            side="top"
            size="small"
            textId="mergeDups.helpText.protectedSense"
            buttonId={`sense-${props.senses[0].guid}-protected`}
          />
        )}
      </div>
      {/* Button for showing the sidebar, when sense card has multiple senses. */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: 0,
          transform: "translateY(-50%)",
        }}
      >
        {props.senses.length > 1 && (
          <IconButton
            onClick={props.toggleFunction}
            id={`sidebar-open-sense-${props.senses[0].guid}`}
            size="large"
          >
            <ArrowForwardIos />
          </IconButton>
        )}
      </div>
      {/* List glosses and (if any) definitions. */}
      <Table padding="none">
        <TableBody>
          {senseTextInLangs.map((senseInLang, index) => (
            <SenseTextRows key={index} senseInLang={senseInLang} />
          ))}
        </TableBody>
      </Table>
      {/* List semantic domains. */}
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
