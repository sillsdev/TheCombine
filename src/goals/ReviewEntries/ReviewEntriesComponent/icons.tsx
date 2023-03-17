import AddBox from "@mui/icons-material/AddBox";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import Check from "@mui/icons-material/Check";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Clear from "@mui/icons-material/Clear";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Edit from "@mui/icons-material/Edit";
import FilterList from "@mui/icons-material/FilterList";
import FirstPage from "@mui/icons-material/FirstPage";
import LastPage from "@mui/icons-material/LastPage";
import Remove from "@mui/icons-material/Remove";
import SaveAlt from "@mui/icons-material/SaveAlt";
import Search from "@mui/icons-material/Search";
import ViewColumn from "@mui/icons-material/ViewColumn";
import { forwardRef, Ref } from "react";

const tableIcons = {
  Add: forwardRef((props: any, ref: Ref<SVGSVGElement>) => (
    <AddBox {...props} ref={ref} />
  )),
  Check: forwardRef((props: any, ref: Ref<SVGSVGElement>) => (
    <Check {...props} ref={ref} />
  )),
  Clear: forwardRef((props: any, ref: Ref<SVGSVGElement>) => (
    <Clear {...props} ref={ref} />
  )),
  Delete: forwardRef((props: any, ref: Ref<SVGSVGElement>) => (
    <DeleteOutline {...props} ref={ref} />
  )),
  DetailPanel: forwardRef((props: any, ref: Ref<SVGSVGElement>) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef((props: any, ref: Ref<SVGSVGElement>) => (
    <Edit {...props} ref={ref} />
  )),
  Export: forwardRef((props: any, ref: Ref<SVGSVGElement>) => (
    <SaveAlt {...props} ref={ref} />
  )),
  Filter: forwardRef((props: any, ref: Ref<SVGSVGElement>) => (
    <FilterList {...props} ref={ref} />
  )),
  FirstPage: forwardRef((props: any, ref: Ref<SVGSVGElement>) => (
    <FirstPage {...props} ref={ref} />
  )),
  LastPage: forwardRef((props: any, ref: Ref<SVGSVGElement>) => (
    <LastPage {...props} ref={ref} />
  )),
  NextPage: forwardRef((props: any, ref: Ref<SVGSVGElement>) => (
    <ChevronRight {...props} ref={ref} />
  )),
  PreviousPage: forwardRef((props: any, ref: Ref<SVGSVGElement>) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props: any, ref: Ref<SVGSVGElement>) => (
    <Clear {...props} ref={ref} />
  )),
  Search: forwardRef((props: any, ref: Ref<SVGSVGElement>) => (
    <Search {...props} ref={ref} />
  )),
  SortArrow: forwardRef((props: any, ref: Ref<SVGSVGElement>) => (
    <ArrowUpward {...props} ref={ref} />
  )),
  ThirdStateCheck: forwardRef((props: any, ref: Ref<SVGSVGElement>) => (
    <Remove {...props} ref={ref} />
  )),
  ViewColumn: forwardRef((props: any, ref: Ref<SVGSVGElement>) => (
    <ViewColumn {...props} ref={ref} />
  )),
};

export default tableIcons;
