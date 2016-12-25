#!/usr/bin/env bash

profile=$1

secrets=$(perl -ne 'print " --secret $1=$2" if (/^([^=]+)=(.*)$/);' .env)

echo $secrets

# exit

wt create \
   --name node-api-sample \
   --profile $profile \
   ./build/bundle.js  \
   $secrets

