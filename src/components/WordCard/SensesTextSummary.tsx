import { type ReactElement } from "react";

import { type Sense } from "api/models";
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

  const typographies: ReactElement[] = [];

  props.senses.forEach((sense) => {
    let texts: string[];
    switch (props.definitionsOrGlosses) {
      case "definitions":
        texts = sense.definitions.map((d) => d.text.trim());
        break;
      case "glosses":
        texts = sense.glosses.map((g) => g.def.trim());
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

    // Use the analysis language of the first non-empty definition/gloss, if any.
    let lang: string | undefined;
    switch (props.definitionsOrGlosses) {
      case "definitions":
        lang = sense.definitions.find((d) => d.text.trim())?.language;
        break;
      case "glosses":
        lang = sense.glosses.find((g) => g.def.trim())?.language;
        break;
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
