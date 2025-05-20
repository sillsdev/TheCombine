import { MenuItem } from "@mui/material";
import { styled } from "@mui/system";

// https://mui.com/system/styled/#using-the-theme
const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  border: "1px solid gray",
  borderRadius: "8px",
  marginTop: "8px",
  "&.Mui-disabled": { opacity: 1 },
  "&:focus": {
    backgroundColor: theme.palette.primary.main,
    "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
      color: theme.palette.common.white,
    },
  },
  overflow: "clip",
}));

export default StyledMenuItem;
