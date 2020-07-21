import {
  LanguagePicker,
  ILanguagePickerStrings,
  languagePickerStrings_en,
} from "mui-language-picker";
import { useState } from "react";
import React from "react";
import { withLocalize, LocalizeContextProps } from "react-localize-redux";

interface PickLanguageProps {}
interface PickLanguageState {
  bcp47: string;
  lgName: string;
  fontName: string;
  tStr: ILanguagePickerStrings;
}

class PickLanguage extends React.Component<
  PickLanguageProps & LocalizeContextProps,
  PickLanguageState
> {
  constructor(props: PickLanguageProps & LocalizeContextProps) {
    super(props);
    this.state = {
      bcp47: "und",
      lgName: "",
      fontName: "",
      tStr: languagePickerStrings_en,
    };
  }
  setBcp47(item: any) {
    this.setState({ bcp47: item });
  }
  setLgName(item: any) {
    this.setState({ lgName: item });
  }
  setFontName(item: any) {
    this.setState({ fontName: item });
  }
  render() {
    return (
      <React.Fragment>
        <LanguagePicker
          value={this.state.bcp47}
          setCode={this.setBcp47}
          name={this.state.lgName}
          setName={this.setLgName}
          font={this.state.fontName}
          setFont={this.setFontName}
          t={this.state.tStr}
        />
      </React.Fragment>
    );
  }
}
export default withLocalize(PickLanguage);
