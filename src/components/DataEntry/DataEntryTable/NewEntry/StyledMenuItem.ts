import { MenuItem } from "@mui/material";
import { styled } from "@mui/system";
import { CSSProperties } from "react";

export const styledBorder: CSSProperties = {
  border: "1px solid gray",
  borderRadius: "8px",
};

// https://mui.com/system/styled/#using-the-theme
const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  ...styledBorder,
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
