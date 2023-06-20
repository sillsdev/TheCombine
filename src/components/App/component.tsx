import loadable from "@loadable/component";
import { ReactElement, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import AnnouncementBanner from "components/AnnouncementBanner/AnnouncementBanner";
import LandingPage from "components/LandingPage";
import Login from "components/Login/LoginPage";
import SignUp from "components/Login/SignUpPage";
import PageNotFound from "components/PageNotFound/component";
import PasswordRequest from "components/PasswordReset/Request";
import PasswordReset from "components/PasswordReset/ResetPage";
import ProjectInvite from "components/ProjectInvite/ProjectInvite";
import RequireAuth from "components/RequireAuth";
import UpperRightToastContainer from "components/Toast/UpperRightToastContainer";
import { Path } from "types/path";
import { routerPath } from "utilities/pathUtilities";

const AppWithBar = loadable(() => import("components/App/AppLoggedIn"));

/**
 * The top-level component
 */
export default function App(): ReactElement {
  return (
    <div className="App">
      <Suspense fallback={<div />}>
        <AnnouncementBanner />
        <UpperRightToastContainer />
        <Routes>
          <Route path={Path.Root} element={<LandingPage />} />
          <Route
            path={routerPath(Path.AppRoot)}
            element={
              <RequireAuth redirectTo={Path.Login}>
                <AppWithBar />
              </RequireAuth>
            }
          />
          <Route path={routerPath(Path.Login)} element={<Login />} />
          <Route path={routerPath(Path.SignUp)} element={<SignUp />} />
          <Route path={`${Path.PwReset}/:token`} element={<PasswordReset />} />
          <Route
            path={routerPath(Path.PwRequest)}
            element={<PasswordRequest />}
          />
          <Route
            path={`${Path.ProjInvite}/:project/:token`}
            element={<ProjectInvite />}
          />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}
