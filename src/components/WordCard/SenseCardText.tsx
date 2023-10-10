import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { ReactElement } from "react";

import { Sense } from "api/models";
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

interface SenseCardTextProps {
  sense: Sense;
  languages?: string[];
}

// Only show first sense's glosses/definitions; in merging, others deleted as duplicates.
// Show first part of speech, if any.
// Show semantic domains from all senses.
// In merging, user can select a different one by reordering in the sidebar.
export default function SenseCardText(props: SenseCardTextProps): ReactElement {
  const senseTextInLangs = getSenseInLanguages(props.sense, props.languages);

  return (
    <Table padding="none">
      <TableBody>
        {senseTextInLangs.map((senseInLang, index) => (
          <SenseTextRows key={index} senseInLang={senseInLang} />
        ))}
      </TableBody>
    </Table>
  );
}
