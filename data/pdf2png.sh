#!/bin/bash
for pdfile in *.pdf ; do
  pdftoppm -png "${pdfile}" "${pdfile%.*}".png
done

