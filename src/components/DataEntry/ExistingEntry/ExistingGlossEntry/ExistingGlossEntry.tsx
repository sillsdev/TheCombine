export class ExistingGlossEntry extends React.Component {
  render() {
    return (
      <Grid
        item
        xs={5}
        style={{
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(2),
          position: "relative"
        }}
      >
        {/* Gloss entry */}

        <TextField
          fullWidth
          value={row.glosses}
          onChange={e => {
            const isSpelledCorrectly = this.isSpelledCorrectly(e.target.value);
            this.updateRow(
              {
                ...row,
                glosses: e.target.value,
                glossSpelledCorrectly: isSpelledCorrectly
              },
              rowIndex
            );
          }}
          onBlur={() => {
            this.updateWordInFrontAndBack(rowIndex).then(() =>
              console.log("Updated word")
            );
          }}
          onKeyDown={e => {
            if (e.key === "Enter") {
              this.focusVernInput();
            }
          }}
          InputProps={
            !row.glossSpelledCorrectly
              ? {
                  style: {
                    color: "red"
                  }
                }
              : {
                  style: {
                    color: "black"
                  }
                }
          }
        />
        {!row.glossSpelledCorrectly && (
          <Tooltip
            title={this.props.translate("addWords.mispelledWord") as string}
            placement="top"
          >
            <div
              style={{
                height: "5px",
                width: "5px",
                border: "2px solid red",
                borderRadius: "50%",
                position: "absolute",
                top: 8,
                right: 48,
                cursor: "pointer"
              }}
              onClick={() => this.toggleSpellingSuggestionsView(rowIndex)}
            />
          </Tooltip>
        )}
      </Grid>
    );
  }
}
