import {
  Box,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { ReactElement } from "react";

import { Sense } from "api/models";
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

const defSx: SxProps = {
  borderInlineStart: "1px solid black",
  mb: 1,
  paddingInlineStart: 1,
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
        <TableCell sx={{ borderBottom: "none" }}>
          <Typography variant="caption">
            {lang}
            {":"}
          </Typography>
        </TableCell>
        <TableCell sx={{ borderBottom: "none" }}>
          <TypographyWithFont lang={lang} sx={{ mb: 1 }} variant="h6">
            {props.senseInLang.glossText}
          </TypographyWithFont>
        </TableCell>
      </TableRow>

      {/* Definition */}
      {!!props.senseInLang.definitionText && !props.hideDefs && (
        <TableRow key={lang + "def"}>
          <TableCell sx={{ borderBottom: "none" }} />
          <TableCell sx={{ borderBottom: "none" }}>
            <Box sx={defSx}>
              <TypographyWithFont color="textSecondary" lang={lang}>
                {props.senseInLang.definitionText}
              </TypographyWithFont>
            </Box>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
