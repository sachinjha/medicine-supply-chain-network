/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { BusinessNetworkDefinition, CertificateUtil, IdCard } = require('composer-common');
const path = require('path');

const chai = require('chai');
chai.should();
chai.use(require('chai-as-promised'));

const namespace = 'org.acme.medicine.supply_chain_network';

describe('medicine supply chain network', () => {
    const cardStore = require('composer-common').NetworkCardStoreManager.getCardStore( { type: 'composer-wallet-inmemory' } );
    let adminConnection;
    let businessNetworkConnection;
    let factory;

    before(async () => {
        // Embedded connection used for local testing
        const connectionProfile = {
            name: 'embedded',
            'x-type': 'embedded'
        };
        // Generate certificates for use with the embedded connection
        const credentials = CertificateUtil.generate({ commonName: 'admin' });

        // PeerAdmin identity used with the admin connection to deploy business networks
        const deployerMetadata = {
            version: 1,
            userName: 'PeerAdmin',
            roles: [ 'PeerAdmin', 'ChannelAdmin' ]
        };

        const deployerCard = new IdCard(deployerMetadata, connectionProfile);
        deployerCard.setCredentials(credentials);

        const deployerCardName = 'PeerAdmin';
        adminConnection = new AdminConnection({ cardStore: cardStore });

        await adminConnection.importCard(deployerCardName, deployerCard);
        await adminConnection.connect(deployerCardName);
    });

    beforeEach(async () => {
        businessNetworkConnection = new BusinessNetworkConnection({ cardStore: cardStore });

        const adminUserName = 'admin';
        let adminCardName;
        const businessNetworkDefinition = await BusinessNetworkDefinition.fromDirectory(path.resolve(__dirname, '..'));

        // Install the Composer runtime for the new business network
        await adminConnection.install(businessNetworkDefinition.getName());

        // Start the business network and configure an network admin identity
        const startOptions = {
            networkAdmins: [
                {
                    userName: adminUserName,
                    enrollmentSecret: 'adminpw'
                }
            ]
        };
        const adminCards = await adminConnection.start(businessNetworkDefinition, startOptions);

        // Import the network admin identity for us to use
        adminCardName = `${adminUserName}@${businessNetworkDefinition.getName()}`;

        await adminConnection.importCard(adminCardName, adminCards.get(adminUserName));

        // Connect to the business network using the network admin identity
        await businessNetworkConnection.connect(adminCardName);

        factory = businessNetworkConnection.getBusinessNetwork().getFactory();
    });

describe ('MedicineUnit', () => {
        it('Manufacturer should be able to add medicinUnit', async () => {

            const manufacturer = factory.newResource( namespace, 'Manufacturer' , 'Manu1');
            manufacturer.name = 'Manu1' ;

            const manufacturingBatchTx = factory.newTransaction( namespace , 'AddManufacturingBatchRecord');
            manufacturingBatchTx.batchId = 'Manu1-batch1';
            manufacturingBatchTx.location = 'Manu1-location1';
            manufacturingBatchTx.validForMonths = 24 ;
            manufacturingBatchTx.manufacturer = factory.newRelationship( namespace,'Manufacturer', manufacturer.$identifier);
           

            const manufacturerRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Manufacturer');
            await manufacturerRegistry.add(manufacturer);

            await businessNetworkConnection.submitTransaction(manufacturingBatchTx);


            const manufacturingBatchRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.ManufacturingBatch');
            const manufacturingBatch = await manufacturingBatchRegistry.get(manufacturingBatchTx.batchId);

            const addMedicineUnitTx = factory.newTransaction( namespace, 'AddMedicineUnitRecord');
            addMedicineUnitTx.unitId = 'Manu1-batch1-unit1';
            addMedicineUnitTx.name = 'med1';
            addMedicineUnitTx.type = 'STRIP';
            addMedicineUnitTx.manufacturer = factory.newRelationship( namespace,'Manufacturer', manufacturer.$identifier);
            addMedicineUnitTx.manufacturingBatch = factory.newRelationship( namespace , 'ManufacturingBatch',  manufacturingBatchTx.batchId) ;


            await businessNetworkConnection.submitTransaction( addMedicineUnitTx);


            const medicineUnitRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.MedicineUnit');
            const medicineUnit = await medicineUnitRegistry.resolve(addMedicineUnitTx.unitId);

           medicineUnit.unitId.should.deep.equal(addMedicineUnitTx.unitId);
            medicineUnit.name.should.deep.equal(addMedicineUnitTx.name);
            medicineUnit.type.should.deep.equal(addMedicineUnitTx.type);
            medicineUnit.batch.batchId.should.deep.equal( manufacturingBatch.batchId);
        });
    });


    describe ('ManufacturingBatch', () => {
        it('Manufacturer should be able to add manufacturingBatch', async () => {

            const manufacturer = factory.newResource( namespace, 'Manufacturer' , 'Manu1');
            manufacturer.name = 'Manu1' ;

            const manufacturingBatchTx = factory.newTransaction( namespace , 'AddManufacturingBatchRecord');
            manufacturingBatchTx.batchId = 'Manu1-batch1';
            manufacturingBatchTx.location = 'Manu1-location1';
            manufacturingBatchTx.validForMonths = 24 ;
            manufacturingBatchTx.manufacturer = factory.newRelationship( namespace,'Manufacturer', manufacturer.$identifier);

            const manufacturerRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Manufacturer');
            await manufacturerRegistry.add(manufacturer);

            await businessNetworkConnection.submitTransaction(manufacturingBatchTx);

            const manufacturingBatchRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.ManufacturingBatch');
            const manufacturingBatch = await manufacturingBatchRegistry.get(manufacturingBatchTx.batchId);

            manufacturingBatch.batchId.should.deep.equal(manufacturingBatchTx.batchId);
            manufacturingBatch.location.should.deep.equal(manufacturingBatchTx.location);
        });
    });

    
});