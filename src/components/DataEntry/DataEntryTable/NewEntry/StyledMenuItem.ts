import { MenuItem } from "@mui/material";
import { withStyles } from "@mui/styles";

// Copied from customized menus at https://material-ui.com/components/menus/
const StyledMenuItem = withStyles((theme) => ({
  root: {
    "&:focus": {
      backgroundColor: theme.palette.primary.main,
      "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
        color: theme.palette.common.white,
      },
    },
  },
}))(MenuItem);

export default StyledMenuItem;
