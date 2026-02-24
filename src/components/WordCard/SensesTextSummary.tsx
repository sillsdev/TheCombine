import { type ReactElement, useContext } from "react";

import { type Sense } from "api/models";
import FontContext from "utilities/fontContext";
import { TypographyWithFont } from "utilities/fontComponents";

interface SensesTextSummaryProp {
  definitionsOrGlosses: "definitions" | "glosses";
  maxLengthPerSense?: number;
  senses: Sense[];
}

export default function SensesTextSummary(
  props: SensesTextSummaryProp
): ReactElement {
  const ellipses = "[...]";
  const interSenseSep = " | ";
  const intraSenseSep = "; ";

  const analysisLangs = useContext(FontContext).analysisLangs;

  const typographies: ReactElement[] = [];

  props.senses.forEach((sense) => {
    let texts: string[];
    let lang: string | undefined;
    switch (props.definitionsOrGlosses) {
      case "definitions":
        if (analysisLangs.length) {
          texts = analysisLangs.flatMap((l) =>
            sense.definitions.filter((d) => d.language === l).map((d) => d.text.trim())
          );
          lang = analysisLangs.find((l) =>
            sense.definitions.some((d) => d.language === l && d.text.trim())
          );
        } else {
          texts = sense.definitions.map((d) => d.text.trim());
          lang = sense.definitions.find((d) => d.text.trim())?.language;
        }
        break;
      case "glosses":
        if (analysisLangs.length) {
          texts = analysisLangs.flatMap((l) =>
            sense.glosses.filter((g) => g.language === l).map((g) => g.def.trim())
          );
          lang = analysisLangs.find((l) =>
            sense.glosses.some((g) => g.language === l && g.def.trim())
          );
        } else {
          texts = sense.glosses.map((g) => g.def.trim());
          lang = sense.glosses.find((g) => g.def.trim())?.language;
        }
        break;
    }
    let text = texts.filter((t) => t).join(intraSenseSep);
    if (!text) {
      return;
    }

    if (props.maxLengthPerSense) {
      const maxLength = Math.max(props.maxLengthPerSense, ellipses.length + 1);
      if (text.length > maxLength) {
        text = `${text.substring(0, maxLength - ellipses.length)}${ellipses}`;
      }
    }

    // Add a sense separator if this isn't the first.
    if (typographies.length) {
      typographies.push(
        <TypographyWithFont analysis display="inline" key={`${sense.guid}-sep`}>
          {interSenseSep}
        </TypographyWithFont>
      );
    }

    typographies.push(
      <TypographyWithFont
        analysis
        display="inline"
        key={`${sense.guid}-text`}
        lang={lang}
      >
        {text}
      </TypographyWithFont>
    );
  });

  return <div>{typographies}</div>;
}
