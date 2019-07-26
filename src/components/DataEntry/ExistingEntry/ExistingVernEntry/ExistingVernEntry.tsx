export class ExistingVernEntry extends React.Component {
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
        {/* Vernacular entry */}

        <TextField
          fullWidth
          value={row.vernacular}
          onChange={e => {
            let dupId = this.vernInFrontier(e.target.value);
            if (dupId === row.id) {
              console.log("Duplicate is same word");
              dupId = ""; // the "duplicate" is the word we're already editing
            }
            this.updateRow(
              {
                ...row,
                vernacular: e.target.value,
                dupId: dupId
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
        />
        {row.dupId !== "" && (
          <Tooltip
            title={this.props.translate("addWords.wordInDatabase") as string}
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
              onClick={() => this.toggleDuplicateVernacularView(rowIndex)}
            />
          </Tooltip>
        )}
      </Grid>
    );
  }
}
