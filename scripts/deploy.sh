#!/bin/sh

set -euf -o pipefail

if [ "$1" == "vaccination" ]; then
  export REACT_APP_TYPE='vaccination'
  export REACT_APP_BACKEND_URL='https://vaccination-form-backend.production-e.asrv.cz'

  deploy_dir='vaccination-form-frontend'
else
  export REACT_APP_TYPE='testing'
  export REACT_APP_BACKEND_URL='https://covid-form-backend.production-e.asrv.cz'

  deploy_dir='covid-form-frontend'
fi

if [ -n "${2-}" ]; then
  servers=("$2")
else
  servers=(production1-tth production2-tth)
fi

deploy_to="deploy/spital/$deploy_dir"
timestamp="$(date +%Y%m%d%H%M)"
keep_releases=5

echo "app type: $REACT_APP_TYPE"
echo "backend url: $REACT_APP_BACKEND_URL"
echo "deploying to $deploy_to as release $timestamp"

yarn build

for server in "${servers[@]}"; do
  echo "deploying to $server"
  scp -r build "$server:$deploy_to/releases/$timestamp" > /dev/null
  ssh -T "$server" <<EOF
    cd "$deploy_to"
    rm current
    ln -s "releases/$timestamp" current
    cd releases
    ls -t | tail -n "+$(($keep_releases + 1))" | xargs rm -r
EOF
done
