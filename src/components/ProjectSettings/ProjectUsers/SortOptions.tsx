import { SortByAlpha } from "@mui/icons-material";
import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
} from "@mui/material";
import React, { ReactElement } from "react";
import { useTranslation } from "react-i18next";

export enum UserOrder {
  Username,
  Name,
  Email,
}

interface SortOptionsProps {
  includeEmail?: boolean;
  onChange: (e: SelectChangeEvent<UserOrder>) => void;
  onReverseClick?: () => void;
}

export default function SortOptions(props: SortOptionsProps): ReactElement {
  const { t } = useTranslation();

  const sortOptions = [
    <MenuItem key="sortByName" value={UserOrder.Name}>
      {t("projectSettings.language.name")}
    </MenuItem>,
    <MenuItem key="sortByUsername" value={UserOrder.Username}>
      {t("login.username")}
    </MenuItem>,
  ];
  if (props.includeEmail) {
    sortOptions.push(
      <MenuItem key="sortByEmail" value={UserOrder.Email}>
        {t("login.email")}
      </MenuItem>
    );
  }

  const reverseButton = () => {
    return props.onReverseClick ? (
      <Tooltip
        title={t("projectSettings.userManagement.reverseOrder")}
        placement="right"
      >
        <IconButton
          onClick={props.onReverseClick}
          id="sorting-order-reverse"
          size="large"
        >
          <SortByAlpha />
        </IconButton>
      </Tooltip>
    ) : (
      <div />
    );
  };

  return (
    <React.Fragment>
      <FormControl variant="standard" style={{ minWidth: 100 }}>
        <InputLabel id="sorting-order-select">
          {t("charInventory.sortBy")}
        </InputLabel>
        <Select
          variant="standard"
          labelId="sorting-order-select"
          defaultValue={UserOrder.Username}
          onChange={props.onChange}
        >
          {sortOptions}
        </Select>
      </FormControl>
      {reverseButton()}
    </React.Fragment>
  );
}
