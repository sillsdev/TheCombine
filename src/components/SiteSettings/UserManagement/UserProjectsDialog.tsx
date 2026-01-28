import { Box, Stack, Typography } from "@mui/material";
import { Fragment, ReactElement } from "react";

import { User } from "api/models";
import UserProjectsList from "components/SiteSettings/UserManagement/UserProjectsList";

interface UserProjectsDialogProps {
  user?: User;
}

export default function UserProjectsDialog(
  props: UserProjectsDialogProps
): ReactElement {
  if (!props.user) {
    return <Fragment />;
  }

  return (
    <Box sx={{ maxWidth: 500 }}>
      <Stack spacing={2}>
        <Typography align="center" variant="h4">
          {props.user.username}
        </Typography>

        <UserProjectsList userId={props.user.id} />
      </Stack>
    </Box>
  );
}
