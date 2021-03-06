/*
 * Copyright 2020 - Transmute Industries Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { MongoDb } from '@sidetree/db';
import QLDBLedger from '@sidetree/qldb';
import Photon from '../Photon';
import config from './photon-config.json';

const resetDatabase = async (): Promise<void> => {
  await MongoDb.resetDatabase(
    config.mongoDbConnectionString,
    config.databaseName!
  );
};

const getTestLedger = async (): Promise<QLDBLedger> => {
  const ledger = new QLDBLedger(config.qldbLedger, config.qldbLedgerTable);
  return ledger;
};

const getTestPhoton = async (): Promise<Photon> => {
  await resetDatabase();
  const ledger = await getTestLedger();
  const photon = new Photon(config, config.versions, ledger);
  await photon.initialize(false, false);
  return photon;
};

const replaceMethod = (
  result: JSON,
  defaultMethod = 'did:elem',
  specificMethod = 'did:photon'
): JSON => {
  const stringified = JSON.stringify(result);
  const updatedStringified = stringified.replace(
    new RegExp(defaultMethod, 'g'),
    specificMethod
  );
  const updateResult = JSON.parse(updatedStringified);
  return updateResult;
};

export { resetDatabase, getTestLedger, getTestPhoton, replaceMethod };
