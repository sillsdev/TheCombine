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
import { shallowEqual } from "react-redux";

import { Sense } from "api/models";
import { useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
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
  languages: string[]
): SenseInLanguage[] {
  return languages.map((l) => getSenseInLanguage(sense, l));
}

interface SenseCardTextProps {
  sense: Sense;
  hideDefs?: boolean;
}

// Show glosses and (if not hideDefs) definitions.
export default function SenseCardText(props: SenseCardTextProps): ReactElement {
  const analysisLangs = useAppSelector(
    (state: StoreState) =>
      state.currentProjectState.project.analysisWritingSystems.map(
        (ws) => ws.bcp47
      ),
    shallowEqual
  );

  const senseLangs = Array.from(
    new Set([
      ...props.sense.glosses.filter((g) => g.def.trim()).map((g) => g.language),
      ...props.sense.definitions
        .filter((d) => d.text.trim())
        .map((d) => d.language),
    ])
  );

  // Display the sense in the analysis languages order first, followed by any other languages.
  const senseInLangs = getSenseInLanguages(props.sense, [
    ...analysisLangs,
    ...senseLangs.filter((l) => !analysisLangs.includes(l)),
  ]);

  return (
    <Table padding="none">
      <TableBody>
        {senseInLangs.map((sil) => (
          <SenseTextRows
            hideDefs={props.hideDefs}
            key={sil.language}
            senseInLang={sil}
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
