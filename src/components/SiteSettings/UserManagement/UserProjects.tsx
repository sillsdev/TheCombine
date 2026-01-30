import { Box, Stack, Typography } from "@mui/material";
import { Fragment, ReactElement } from "react";

import { User } from "api/models";
import UserProjectsList from "components/SiteSettings/UserManagement/UserProjectsList";

interface UserProjectsProps {
  user?: User;
}

export default function UserProjects(props: UserProjectsProps): ReactElement {
  if (!props.user) {
    return <Fragment />;
  }

  const { email, id, name, username } = props.user;

  return (
    <Box sx={{ maxWidth: 500 }}>
      <Stack spacing={2}>
        <Typography align="center" variant="h4">
          {name}
        </Typography>

        <Typography align="center" variant="h5">
          {`(${username} | ${email})`}
        </Typography>

        <UserProjectsList userId={id} />
      </Stack>
    </Box>
  );
}
