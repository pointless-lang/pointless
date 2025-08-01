#!/bin/bash

google-chrome --headless --no-pdf-header-footer --print-to-pdf=$1.pdf $1.html
