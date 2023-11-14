import { MenuItem } from "@mui/material";
import { withStyles } from "@mui/styles";

// Copied from customized menus at https://material-ui.com/components/menus/
const StyledMenuItem = withStyles((theme) => ({
  root: {
    border: "1px solid gray",
    borderRadius: "8px",
    marginTop: "8px",
    "&:focus": {
      backgroundColor: theme.palette.primary.main,
      "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
        color: theme.palette.common.white,
      },
    },
  },
}))(MenuItem);

export default StyledMenuItem;
