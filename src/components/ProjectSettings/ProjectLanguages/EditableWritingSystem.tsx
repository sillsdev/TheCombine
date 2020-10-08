import { Grid, Button } from "@material-ui/core";
import { Check, Clear, Edit } from "@material-ui/icons";
import { LanguagePicker, languagePickerStrings_en } from "mui-language-picker";
import React from "react";
import { Translate } from "react-localize-redux";

import { WritingSystem } from "../../../types/project";

interface EditableWritingSystemProps {
  ws: WritingSystem;
  index?: number;
  update: (ws: WritingSystem, index?: number) => void;
}

interface EditableWritingSystemState {
  name: string;
  bcp47: string;
  font: string;
  edit: boolean;
}

export default class EditableWritingSystem extends React.Component<
  EditableWritingSystemProps,
  EditableWritingSystemState
> {
  constructor(props: EditableWritingSystemProps) {
    super(props);
    this.state = { ...props.ws, edit: false };
  }

  conditionalUpdate() {
    const name: string = this.state.name;
    const bcp47: string = this.state.bcp47;
    const font: string = this.state.font;
    if (
      name !== this.props.ws.name ||
      bcp47 !== this.props.ws.bcp47 ||
      font !== this.props.ws.font
    ) {
      this.props.update({ name, bcp47, font }, this.props.index);
    }
    this.setState({ edit: false });
  }

  resetWritingSystem() {
    this.setState({ ...this.props.ws, edit: false });
  }

  render() {
    return (
      <React.Fragment key={this.props.index}>
        {this.state.edit ? (
          <Grid container spacing={1}>
            <Grid item>
              <LanguagePicker
                value={this.state.bcp47}
                setCode={(bcp47: string) => this.setState({ bcp47 })}
                name={this.state.name}
                setName={(name: string) => this.setState({ name })}
                font={this.state.font}
                setFont={(font: string) => this.setState({ font })}
                t={languagePickerStrings_en}
              />
            </Grid>
            <Grid item>
              <Button onClick={() => this.conditionalUpdate()}>
                <Check />
              </Button>
            </Grid>
            <Grid item>
              <Button onClick={() => this.resetWritingSystem()}>
                <Clear />
              </Button>
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={1}>
            <ImmutableWritingSystem
              ws={this.props.ws}
              index={this.props.index}
              icon={<Edit />}
              iconAction={() => this.setState({ edit: true })}
            />
          </Grid>
        )}
      </React.Fragment>
    );
  }
}

interface ImmutableWritingSystemProps {
  ws: WritingSystem;
  index?: number;
  icon?: any;
  iconAction?: () => void;
}

export class ImmutableWritingSystem extends React.Component<
  ImmutableWritingSystemProps
> {
  render() {
    return (
      <Grid container spacing={1}>
        {this.props.index !== undefined && (
          <Grid item>{`${this.props.index + 1}. `}</Grid>
        )}
        <Grid item>
          <Translate id="projectSettings.language.name" />
          {": "}
          {this.props.ws.name} {", "}
        </Grid>
        <Grid item>
          <Translate id="projectSettings.language.bcp47" />
          {": "}
          {this.props.ws.bcp47}
          {", "}
        </Grid>
        <Grid item>
          <Translate id="projectSettings.language.font" />
          {": "}
          {this.props.ws.font}
        </Grid>
        {this.props.icon ? (
          <Grid item>
            <Button onClick={this.props.iconAction}>{this.props.icon}</Button>
          </Grid>
        ) : null}
      </Grid>
    );
  }
}
