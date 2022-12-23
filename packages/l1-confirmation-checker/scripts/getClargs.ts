/*
 * Copyright 2021, Offchain Labs, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// import yargs from 'yargs/yargs';
'use strict';
import yargs from 'yargs/yargs';

const argv = yargs(process.argv.slice(2))
  .options({
    l2NetworkID: {
      type: 'number',
    },
    action: {
      type: 'string',
    },
    blockHash: {
      type: 'string'
    }
  })
  .demandOption('action')
  .parseSync();

export default argv;
