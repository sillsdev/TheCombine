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
import { Fragment, ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { User } from "api/models";

export enum UserOrder {
  Username,
  Name,
  Email,
}

export function getUserCompare(
  order: UserOrder,
  reverse = false
): (a: User, b: User) => number {
  const rev = reverse ? -1 : 1;
  return (a: User, b: User) => {
    switch (order) {
      case UserOrder.Name:
        return a.name.localeCompare(b.name) * rev;
      case UserOrder.Username:
        return a.username.localeCompare(b.username) * rev;
      case UserOrder.Email:
        return a.email.localeCompare(b.email) * rev;
      default:
        throw new Error();
    }
  };
}

interface SortOptionsProps {
  includeEmail?: boolean;
  onChange: (e: SelectChangeEvent<UserOrder>) => void;
  onReverseClick?: () => void;
}

export default function SortOptions(props: SortOptionsProps): ReactElement {
  const { t } = useTranslation();

  const sortOptions: ReactElement[] = [
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

  const reverseButton = (): ReactElement => {
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
      <Fragment />
    );
  };

  return (
    <>
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
    </>
  );
}
