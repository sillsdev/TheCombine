import { ReactElement, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import * as backend from "backend";
import InvalidLink from "components/InvalidLink";
import Signup from "components/Login/Signup";
import { Path } from "types/path";

export default function ProjectInvite(): ReactElement {
  const navigate = useNavigate();
  const { token, project } = useParams();
  const [isValidLink, setIsValidLink] = useState(false);

  const validateLink = useCallback(async (): Promise<void> => {
    if (project && token) {
      const status = await backend.validateLink(project, token);
      if (status.isTokenValid && status.isUserValid) {
        navigate(Path.Login);
        return;
      }
      setIsValidLink(status.isTokenValid);
    }
  }, [project, token, navigate]);

  useEffect(() => {
    validateLink();
  });

  return isValidLink ? (
    <Signup returnToEmailInvite={validateLink} />
  ) : (
    <InvalidLink textId="invite.invalidInvitationURL" />
  );
}
