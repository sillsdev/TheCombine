# create_ap

`create_ap` is a bash shell script that creates a WiFi access point using `hostapd` and `dnsmasq`.

The `create_ap` file is downloaded from the [oblique/create_ap](https://github.com/oblique/create_ap) project on GitHub.
It is current as of 3 March 2021 (commit
[462c09f](https://github.com/oblique/create_ap/commit/462c09fc88d9d6a6037e8f5b64f14492508bba90)). The customizations
necessary for _TheCombine_ are found in the `templates` directory for this role.

The GitHub project is no longer maintained. Although `create_ap` serves the present purposes of _TheCombine_ it may be
beneficial to consider one of the currently maintained forks on the `create_ap` project page:

- [linux-wifi-hotspot](https://github.com/lakinduakash/linux-wifi-hotspot) - Fork that is focused on providing GUI and
  improvements.
- [linux-router](https://github.com/garywill/linux-router) - Fork that is focused on providing new features and
  improvements which are not limited to WiFi. Some interesting features are: sharing Internet to a wired interface and
  sharing Internet via a transparent proxy using redsocks.

Additional documentation is available at the GitHub project page.
