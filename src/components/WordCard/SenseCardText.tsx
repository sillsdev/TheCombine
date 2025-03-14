import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { CSSProperties, ReactElement } from "react";

import { Sense } from "api/models";
import theme from "types/theme";
import { TypographyWithFont } from "utilities/fontComponents";

interface SenseInLanguage {
  language: string; // bcp-47 code
  glossText: string;
  definitionText: string;
}

function getSenseInLanguage(
  sense: Sense,
  language: string,
  displaySep = "; "
): SenseInLanguage {
  const glossText = sense.glosses
    .filter((g) => g.language === language)
    .map((g) => g.def)
    .join(displaySep);
  const definitionText = sense.definitions
    .filter((d) => d.language === language)
    .map((d) => d.text)
    .join(displaySep);
  return { language, glossText, definitionText };
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

interface SenseCardTextProps {
  sense: Sense;
  hideDefs?: boolean;
  languages?: string[];
}

// Show glosses and (if not hideDefs) definitions.
export default function SenseCardText(props: SenseCardTextProps): ReactElement {
  const senseTextInLangs = getSenseInLanguages(props.sense, props.languages);

  return (
    <Table padding="none">
      <TableBody>
        {senseTextInLangs.map((senseInLang, index) => (
          <SenseTextRows
            hideDefs={props.hideDefs}
            key={index}
            senseInLang={senseInLang}
          />
        ))}
      </TableBody>
    </Table>
  );
}

const defStyle: CSSProperties = {
  borderInlineStart: "1px solid black",
  marginBottom: theme.spacing(1),
  paddingInlineStart: theme.spacing(1),
};

interface SenseTextRowsProps {
  senseInLang: SenseInLanguage;
  hideDefs?: boolean;
}

function SenseTextRows(props: SenseTextRowsProps): ReactElement {
  const lang = props.senseInLang.language;
  return (
    <>
      {/* Gloss */}
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
            variant="h6"
          >
            {props.senseInLang.glossText}
          </TypographyWithFont>
        </TableCell>
      </TableRow>

      {/* Definition */}
      {!!props.senseInLang.definitionText && !props.hideDefs && (
        <TableRow key={lang + "def"}>
          <TableCell style={{ borderBottom: "none" }} />
          <TableCell style={{ borderBottom: "none" }}>
            <div style={defStyle}>
              <TypographyWithFont color="textSecondary" lang={lang}>
                {props.senseInLang.definitionText}
              </TypographyWithFont>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
