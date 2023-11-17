import { List } from "@mui/material";
import { styled } from "@mui/system";

// https://mui.com/system/styled/#using-the-theme
const StyledList = styled(List)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  maxWidth: "auto",
  width: "100%",
}));

export default StyledList;
