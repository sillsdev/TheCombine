#! /usr/bin/env bash

# Required packages:
# - pandoc
# - weasyprint

pandoc --pdf-engine=weasyprint README.md -o README.pdf
