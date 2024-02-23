#! /usr/bin/env bash

dconf load /org/gnome/terminal/legacy/profiles:/ < ${HOME}/.config/user-terminal-prefs/gnome-terminal-profiles.dconf
