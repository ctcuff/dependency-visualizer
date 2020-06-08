#!/bin/bash
# The gh-pages script doesn't trigger husky's pre-commit
# or pre-push hooks before for deployment so this is a small script
# to bail if there are any lint errors before gh-pages pushes

yarn lint

if [ $? -eq 0 ]
then
    yarn build && yarn gh-pages -d build
fi
