# Combine Release Process

This document defines the process for releasing a new software version of _The Combine_.

## Assumptions

The release process has the following assumptions:

- release versions follow [semantic versioning](https://semver.org/); that is, they have the form major.minor.patch
  version numbers where `major`, `minor`, and `patch` are all integer values. See the page on semantic versioning for
  instructions on when the major, minor, and patch version number should be incremented when a new version is released.
- the user has setup his/her Python environment according to the directions in the project
  [README](https://github.com/sillsdev/TheCombine/blob/master/README.md#python) file.
- the user has write permissions for _The Combine_ project on _GitHub_.

## Using the GitHub Interface to New Release

You can create the release on _GitHub_ as follows:

1. Click on the _Releases_ link on the project home page. The link is in the right side-pane:

   !['Releases' Link on Home Page](images/click_releases.png "'Releases' Link on Home Page")

2. Click the _Draft a new release_ button at the top right of the _Releases_ page:

   !['Draft a New Release' Button](images/draft_new_release.png "'Draft a New Release' Button")

3. Fill out the form for the new release:

   ![New Release Form](images/new_release_form.png "New Release Form")

   1. Fill in the Release Number. Click the _Choose a tag_ dropdown menu; select _Find or create a new tag_; and enter
      the new release version, e.g. `0.7.25`
   2. Enter the _Release title_ with the title `Release` followed by the release number, e.g. `Release 0.7.25`.
   3. Click the _Auto-generate release notes_ button.

4. Press the _Publish Release_ button at the bottom of the page:

   !['Publish release' button](images/publish_release.png "'Publish release' button")

When the release is published, the Continuous Deployment process will build the software for the new release and install
it on the Live server.
