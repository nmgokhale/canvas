#!/bin/bash

#
# Copyright 2017-2025 Elyra Authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

set -e

WORKING_DIR="$PWD"
SCRIPT_DIR=$(dirname "$0")

echo "cd $SCRIPT_DIR"
cd $SCRIPT_DIR
# install require modules
echo "npm install"
npm install
echo "npm run build"
npm run build
# Tests are skipped when deploying the test harness to the cloud.
if [ "$SKIP_TESTS" = "true" ]; then
    echo "Skipping tests as SKIP_TESTS is set"
else
    echo "Run jest tests"
    npm run test-coverage
fi
npm run test:typescript

echo "cd $WORKING_DIR"
cd $WORKING_DIR
