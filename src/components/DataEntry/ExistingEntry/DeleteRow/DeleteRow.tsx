export class DeleteRow extends React.Component {
  render() {
    return (
      <Grid item xs={2}>
        {this.state.hoverIndex === rowIndex && (
          <React.Fragment>
            <Tooltip
              title={this.props.translate("addWords.deleteRow") as string}
              placement="top"
            >
              <IconButton
                size="small"
                onClick={() =>
                  this.removeWord(row.id, () => this.removeRow(rowIndex))
                }
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </React.Fragment>
        )}
      </Grid>
    );
  }
}
