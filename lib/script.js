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

/* global getFactory getAssetRegistry getParticipantRegistry emit */





// MANUFACTURER FUNCTIONS
/**
 * add manufacturing batch 
 * @param {org.acme.medicine.supply_chain_network.AddManufacturingBatchRecord} addManufacturingBatchRecord - the addManufacturingBatchRecord transaction
 * @transaction
 */
async function addManufacturingBatchRecord(manufacturingBatchRequest) { // eslint-disable-line no-unused-vars
    console.log('addManufacturingBatchRecord');

    const factory = getFactory();
    const namespace = 'org.acme.medicine.supply_chain_network';

    const manufacturingBatch = factory.newResource(namespace, 'ManufacturingBatch', manufacturingBatchRequest.batchId);
    manufacturingBatch.location = manufacturingBatchRequest.location;
    manufacturingBatch.manufacturingDate = new Date() ;
    manufacturingBatch.expiryDate = manufacturingBatch.manufacturingDate ;
    manufacturingBatch.expiryDate.setMonth (manufacturingBatch.expiryDate.getMonth()  + manufacturingBatchRequest.validForMonths ) ;
    manufacturingBatch.manufacturer = factory.newRelationship(namespace, 'Manufacturer', manufacturingBatchRequest.manufacturer.companyId);
    
    // save the manufactringBatch
    const assetRegistry = await getAssetRegistry(manufacturingBatch.getFullyQualifiedType());
    await assetRegistry.add(manufacturingBatch);

}



/**
 * add medicine unit
 * @param {org.acme.medicine.supply_chain_network.AddMedicineUnitRecord} addMedicineUnitRecord - the addMedicineUnitRecord transaction
 * @transaction
 */
async function addMedicineUnitRecord(medicineUnitRequest) { // eslint-disable-line no-unused-vars
    console.log('addMedicineUnitRecord');

    const factory = getFactory();
    const namespace = 'org.acme.medicine.supply_chain_network';

    const medicineUnit = factory.newResource(namespace, 'MedicineUnit', medicineUnitRequest.unitId);
    medicineUnit.name = medicineUnitRequest.name;
    medicineUnit.type = medicineUnitRequest.type;

    const manufacturingBatch = medicineUnitRequest.manufacturingBatch ;

    medicineUnit.manufacturingDate = manufacturingBatch.manufacturingDate ;
    medicineUnit.expiryDate = manufacturingBatch.expiryDate ;
    medicineUnit.batch = factory.newRelationship(namespace, 'ManufacturingBatch', manufacturingBatch.batchId) ;
    
    medicineUnit.owner = factory.newRelationship(namespace, 'Manufacturer', medicineUnitRequest.manufacturer.companyId);

    
    // save the medicineUnit 
    const assetRegistry = await getAssetRegistry(medicineUnit.getFullyQualifiedType());
    await assetRegistry.add(medicineUnit);

}

/**
 * Place an order for a vehicle
 * @param {org.acme.medicine.supply_chain_network.CreatePurchaseOrder} CreatePurchaseOrder - the createPurchaseOrder transaction
 * @transaction
 */
async function createPurchaseOrder(purchaseOrderRequest) { // eslint-disable-line no-unused-vars
    console.log('addMedicineUnitRecord');

    const factory = getFactory();
    const namespace = 'org.acme.medicine.supply_chain_network';

    const purchaseOrder = factory.newResource(namespace, 'PurchaseOrder', purchaseOrderRequest.poId);
    purchaseOrder.quantity = purchaseOrderRequest.quantity;
    purchaseOrder.medicines = purchaseOrderRequest.medicines;
    purchaseOrder.status = "OPEN"
    
    purchaseOrder.manufacturingBatch = factory.newRelationship(namespace, 'ManufacturingBatch', medicineUnitRequest.batchId) ;
    const participant = getCurrentParticipant();
    purchaseOrder.createdBy = factory.newRelationship(namespace, participant.getName() , participant.companyId);
    
    purchaseOrder.createdBy = factory.newRelationship(namespace, purchaseOrderRequest.createdFor.getName() , purchaseOrderRequest.createdFor.companyId);
    
    // save the purchaseOrder 
    const assetRegistry = await getAssetRegistry(purchaseOrder.getFullyQualifiedType());
    await assetRegistry.add(purchaseOrder);

}





/**
 * Place an order for a vehicle
 * @param {org.acme.medicine.supply_chain_network.AcceptOrder} acceptOrder - the createPurchaseOrder transaction
 * @transaction
 */
async function acceptOrder(acceptOrderRequest) { // eslint-disable-line no-unused-vars
    console.log('addMedicineUnitRecord');

    const factory = getFactory();
    const namespace = 'org.acme.medicine.supply_chain_network';

    const salesOrder = factory.newResource(namespace, 'SalesOrder',  "so_" +  purchaseOrderRequest.poId );
   
    
    salesOrder.purchaseOrder = factory.newRelationship(namespace, 'PurchaseOrder', acceptOrderRequest.batchId) ;
    const participant = getCurrentParticipant();
    salesOrder.createdBy = factory.newRelationship(namespace, participant.getName() , participant.companyId);
    salesOrder.status = "OPEN"
    // save the purchaseOrder 
    const assetRegistry = await getAssetRegistry(salesOrder.getFullyQualifiedType());
    await assetRegistry.add(salesOrder);

}


/**
 * Place an order for a vehicle
 * @param {org.acme.medicine.supply_chain_network.CreateShippingRequest} shippingRequest - the createShippingRequest transaction
 * @transaction
 */
async function createShippingRequest(shippingRequest) { // eslint-disable-line no-unused-vars
    console.log('createShippingRequest');

    const factory = getFactory();
    const namespace = 'org.acme.medicine.supply_chain_network';

    const sRequest = factory.newResource(namespace, 'ShippingRequest',  "sr_" +  shippingRequest.salesOrder.purchaseOrder.poId );
   
    
    sRequest.salesOrder = factory.newRelationship(namespace, 'SalesOrder', shippingRequest.salesOrder.soId) ;
    sRequest.logisticsProvider = factory.newRelationship(namespace, 'LogisticsProvider', sRequest.logisticsProvider.companyId) ;
    
    const participant = getCurrentParticipant();
    sRequest.from = factory.newRelationship(namespace, participant.getName() , participant.companyId);

    const to = shippingRequest.salesOrder.purchaseOrder.createdBy ; 
    sRequest.to = factory.newRelationship(namespace, participant.getName() , to.companyId);
    sRequest.status = "OPEN"

    // save the shippingRequest 
    const assetRegistry = await getAssetRegistry(sRequest.getFullyQualifiedType());
    await assetRegistry.add(sRequest);


    // create shipping container 
    const purchaseOrder = shippingRequest.salesOrder.purchaseOrder ;

    const sContainer = factory.newResource(namespace, 'ShippingContainer',  "sc_" +  purchaseOrder.poId );
    sContainer.request = factory.newRelationship(namespace, sRequest.getName() , sRequest.reqId);
    sContainer.owner = factory.newRelationship(namespace, participant.getName() , participant.companyId);
    sContainer.status = "WITHCREATOR"

    // find and add medicineUnits to shipping container
    let medUnits = []
    purchaseOrder.medicines.forEach ( async( medicine)=>{
        let medUnit = await  query('selectMedicineUnitsByNameAndOwnerForGivenQuantity', { name: medicine.name, quantity: medicine.quantity, owner: participant })
        medUnits.push ( medUnit ) ;
      
    })

    let allMedUnits = await Promises.all( medUnits)
    sContainer.medicines = [] ;
    allMedUnits.forEach( (medUnit) => {
        sContainer.medicines.push (  factory.newRelationship(namespace, medUnit.getName() , medUnit.unitId) ) ;
    })
    
    const sContainerAssetRegistry = await getAssetRegistry(sContainer.getFullyQualifiedType());
    await sContainerAssetRegistry.add( sContainer);

}

async function updateOwnerMedicineUnits ( medicineUnits, owner, soldTo){


    const namespace = 'org.acme.medicine.supply_chain_network';
    const assetRegistry = await getAssetRegistry( namespace + '.MedicineUnit');
    medicineUnits.forEach ( async (medicineUnit) => {
            let medUnit = await assetRegistry.get(medicineUnit.unitId);
            if( !soldTo ){
                 medUnit.owner = factory.newRelationship(namespace, owner.getName() , owner.companyId)  ;
            }else{
                medUnit.soldTo = factory.newRelationship(namespace, owner.getName() , owner.personId)  ;
            }
            await assetRegistry.update( medUnit) ;
    })


}





/**
 * Place an order for a vehicle
 * @param {org.acme.medicine.supply_chain_network.AcceptShippingRequest} acceptShippingRequest - the createPurchaseOrder transaction
 * @transaction
 */
async function acceptShippingRequest(acceptShippingRequest) { // eslint-disable-line no-unused-vars
    console.log('acceptShippingRequest');

    const factory = getFactory();
    const namespace = 'org.acme.medicine.supply_chain_network';
    const assetRegistry  = await getAssetRegistry(namespace + '.ShippingRequest');

    let sRequest = await sRequestAssetRegistry.get(acceptShippingRequest.shippingRequest.reqId)
    sRequest.status = "ACCEPTED"
    // save the acceptShippingRequest 
    
    await assetRegistry.update(sRequest);  
}



/**
 * Place an order for a vehicle
 * @param {org.acme.medicine.supply_chain_network.GoodsHandedOver} goodsHandedOver - the goodsHandedOver transaction
 * @transaction
 */
async function goodsHandedOver(goodsHandedOverRequest) { // eslint-disable-line no-unused-vars
    console.log('goodsHandedOver');

    const factory = getFactory();
    const namespace = 'org.acme.medicine.supply_chain_network';
    const sRequestAssetRegistry  = await getAssetRegistry(namespace + '.ShippingRequest');
    const assetRegistry  = await getAssetRegistry(namespace + '.ShippingContainer');

    let shippingContainer = await assetRegistry.get(goodsHandedOverRequest.shippingContainer.containerId)
    shippingContainer.owner = goodsHandedOverRequest.newOwner ;

    // save the shippingContainer
    await assetRegistry.update(shippingContainer);
}


/**
 * Place an order for a vehicle
 * @param {org.acme.medicine.supply_chain_network.GoodsPickedUp} goodsPickeUp - the goodsHandedOver transaction
 * @transaction
 */
async function goodsPickedUp(goodsPickedUpRequest) { // eslint-disable-line no-unused-vars
    console.log('goodsHandedOver');

    const factory = getFactory();
    const namespace = 'org.acme.medicine.supply_chain_network';
    const sRequestAssetRegistry  = await getAssetRegistry(namespace + '.ShippingRequest');
    
    const assetRegistry  = await getAssetRegistry(namespace + '.ShippingContainer');
    
    let shippingContainer = await assetRegistry.get(goodsPickedUpRequest.shippingContainer.containerId)
    shippingContainer.status = "WITHLOGISTICS"
    await assetRegistry.update(shippingContainer);
    await updateOwnerMedicineUnits ( shippingContainer.medicines, getCurrentParticipant(), false);


}


/**
 * Place an order for a vehicle
 * @param {org.acme.medicine.supply_chain_network.GoodsReceived} goodsReceived - the goodsHandedOver transaction
 * @transaction
 */
async function goodsReceived(goodsReceivedRequest) { // eslint-disable-line no-unused-vars
    console.log('goodsHandedOver');

    const factory = getFactory();
    const namespace = 'org.acme.medicine.supply_chain_network';
    
    const assetRegistry  = await getAssetRegistry(namespace + '.ShippingContainer');

    let shippingContainer = await assetRegistry.get(goodsReceivedRequest.shippingContainer.containerId)
    shippingContainer.status = "WITHRECEIVER"
    await assetRegistry.update(shippingContainer);
    await updateOwnerMedicineUnits ( shippingContainer.medicines, getCurrentParticipant(), false);
}



/**
 * Place an order for a vehicle
 * @param {org.acme.medicine.supply_chain_network.SoldToCustomer} soldToCustomer - the soldToCustomer transaction
 * @transaction
 */
async function soldToCustomer(sellRequest) { // eslint-disable-line no-unused-vars
    console.log('goodsHandedOver');

    
    await updateOwnerMedicineUnits ( sellRequest.medicines, sellRequest.customer , true);
}


/**
 * Place an order for a vehicle
 * @param {org.acme.medicine.supply_chain_network.VerifyAuthenticity} verifyAuthenticity - the verifyAuthenticity transaction
 * @transaction
 */


async function verifyAuthenticity(verifyRequest) { // eslint-disable-line no-unused-vars
    console.log('goodsHandedOver');

    const factory = getFactory();
    const namespace = 'org.acme.medicine.supply_chain_network';
    
    const assetRegistry  = await getAssetRegistry(namespace + '.MedicineUnit');
    let medUnit = await assetRegistry.resolve( verifyRequest.unitId);

    if ( medUnit.owner.name != verifyRequest.owner ) 
        throw new Error("Medicine doesn't belong to owner")
  
}

