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



transaction addMedicineUnitRecord {
  o String unitId 
  --> MedicineUnit medicineUnit
  --> ManufacturingBatch manufacturingBatch
}

transaction createPurchaseOrder {
  o String poId 
  o Integer quantity
  o String medicineName
  --> Company createdBy
  --> Company createdFor
}

transaction acceptOrder {
  --> PurchaseOrder purchaseOrder
  --> Company createdBy 
}

transaction createShippingRequest{
  --> SalesOrder salesOrder 
  --> LogisticsProvider logisticsProvider 
  --> Company from 
  --> Company to 
}

transaction acceptShippingRequest{
  --> ShippingRequest shippingRequest 
  --> LogisticsProvider logisticsProvider
}

transaction goodsHandedOver{
  --> ShippingRequest shippingRequest 
  --> LogisticsProvider logisticsProvider
  --> Company by
}

transaction goodsPickedUp {
  --> ShippingContainer shippingContainer 
  --> LogisticsProvider logisticsProvider
  --> Company from
}

transaction goodsReceived {
  --> ShippingContainer shippingContainer 
  --> Company by
}

transaction soldToCustomer {
  --> Person customer 
  --> MedicineUnit medicineUnit
  --> Company retailer
}

transaction verifyAuthenticity {
  --> Person verifier
  --> MedicineUnit medicineUnit
}




// MANUFACTURER FUNCTIONS
/**
 * Place an order for a vehicle
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
    const participant = getCurrentParticipant();
    manufacturingBatch.manufacturer = factory.newRelationship(namespace, 'Manufacturer', participant.companyId);
    
    // save the manufactringBatch
    const assetRegistry = await getAssetRegistry(manufacturingBatch.getFullyQualifiedType());
    await assetRegistry.add(manufacturingBatch);

}



/**
 * Place an order for a vehicle
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
    medicineUnit.manufacturingBatch = factory.newRelationship(namespace, 'ManufacturingBatch', manufacturingBatch.batchId) ;
    const participant = getCurrentParticipant();
    medicineUnit.owner = factory.newRelationship(namespace, 'Manufacturer', participant.companyId);
    
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
 * @param {org.acme.medicine.supply_chain_network.ShippingRequest} shippingRequest - the createPurchaseOrder transaction
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
    purchaseOrder.medicines.forEach ( function( medicine){
        medUnits.push ( await  query('selectMedicineUnitsByNameAndOwnerForGivenQuantity', { name: medicine.name, quantity: medicine.quantity, owner: participant }) ) ;
      
    })

    let allMedUnits = await Promises.all( medUnits)
    sContainer.medicines = [] ;
    allMedUnits.forEach( (medUnit) => {
        sContainer.medicines.push (  factory.newRelationship(namespace, medUnit.getName() , medUnit.unitId) ) ;
    })
    
    const sContainerAssetRegistry = await getAssetRegistry(sContainer.getFullyQualifiedType());
    await sContainerAssetRegistry.add( sContainer);


}

async function updateOwnerMedicineUnits ( medicineUnits, owner){

    const namespace = 'org.acme.medicine.supply_chain_network';

    const assetRegistry = await getAssetRegistry( namespace + '.MedicineUnit');
    medicineUnits.forEach ( (medUnit) => {
            let medUnit = await assetRegistry.get(medUnit.unitId);
            medUnit.owner = factory.newRelationship(namespace, owner.getName() , owner.companyId)  ;
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
    
    if ( acceptShippingRequest.shippingRequest.logistics == getCurrentParticipant() ) {
        const assetRegistry  = await getAssetRegistry(namespace + '.ShippingRequest');
    
        let sRequest = await sRequestAssetRegistry.get(acceptShippingRequest.shippingRequest.reqId)
        sRequest.status = "ACCEPTED"
        // save the acceptShippingRequest 
        
        await assetRegistry.update(sRequest);

    }else{
        throw new Error( "You are not authorized to perform this operation" )
    }

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
    
    let sRequest = await sRequestAssetRegistry.get(goodsHandedOverRequest.shippingContainer.request.reqId)
    
    if ( sRequest.from == getCurrentParticipant() ) {
        const assetRegistry  = await getAssetRegistry(namespace + '.ShippingContainer');
    
        let shippingContainer = await assetRegistry.get(goodsHandedOverRequest.shippingContainer.containerId)
        shippingContainer.owner = goodsHandedOverRequest.newOwner ;

        // save the shippingContainer 
        
        await assetRegistry.update(shippingContainer);

        
    }else{
        throw new Error( "You are not authorized to perform this operation" )
    }

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
    
    let sRequest = await sRequestAssetRegistry.get(goodsPickedUpRequest.shippingContainer.request.reqId)
    
    if ( sRequest.logistics == getCurrentParticipant() ) {
        const assetRegistry  = await getAssetRegistry(namespace + '.ShippingContainer');
    
        let shippingContainer = await assetRegistry.get(goodsPickedUpRequest.shippingContainer.containerId)
        shippingContainer.status = "WITHLOGISTICS"
       
        
        await assetRegistry.update(shippingContainer);
        await updateOwnerMedicineUnits ( shippingContainer.medicines, sRequest.logistics);


    }else{
        throw new Error( "You are not authorized to perform this operation" )
    }

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
     const sRequestAssetRegistry  = await getAssetRegistry(namespace + '.ShippingRequest');
    
    let sRequest = await sRequestAssetRegistry.get(goodsReceivedRequest.shippingContainer.request.reqId)
    
    if ( sRequest.to == getCurrentParticipant() ) {
        const assetRegistry  = await getAssetRegistry(namespace + '.ShippingContainer');
    
        let shippingContainer = await assetRegistry.get(goodsReceivedRequest.shippingContainer.containerId)
        shippingContainer.status = "WITHRECEIVER"
       
        
        await assetRegistry.update(shippingContainer);
        await updateOwnerMedicineUnits ( shippingContainer.medicines, sRequest.to);


    }else{
        throw new Error( "You are not authorized to perform this operation" )
    }

}


/**
 * Update the status of an order
 * @param {org.acme.vehicle_network.UpdateOrderStatus} updateOrderStatus - the UpdateOrderStatus transaction
 * @transaction
 */
async function updateOrderStatus(updateOrderRequest) { // eslint-disable-line no-unused-vars
    console.log('updateOrderStatus');

    const factory = getFactory();
    const namespace = 'org.acme.vehicle_network';

    // get vehicle registry
    const vehicleRegistry = await getAssetRegistry(namespace + '.Vehicle');
    if (updateOrderRequest.orderStatus === 'VIN_ASSIGNED') {
        if (!updateOrderRequest.vin) {
            throw new Error('Value for VIN was expected');
        }
        // create a vehicle
        const vehicle = factory.newResource(namespace, 'Vehicle', updateOrderRequest.vin );
        vehicle.vehicleDetails = updateOrderRequest.order.vehicleDetails;
        vehicle.vehicleStatus = 'OFF_THE_ROAD';
        await vehicleRegistry.add(vehicle);
    } else if(updateOrderRequest.orderStatus === 'OWNER_ASSIGNED') {
        if (!updateOrderRequest.vin) {
            throw new Error('Value for VIN was expected');
        }

        // assign the owner of the vehicle to be the person who placed the order
        const vehicle = await vehicleRegistry.get(updateOrderRequest.vin);
        vehicle.vehicleStatus = 'ACTIVE';
        vehicle.owner = factory.newRelationship(namespace, 'Person', updateOrderRequest.order.orderer.username);
        await vehicleRegistry.update(vehicle);
    }

    // update the order
    const order = updateOrderRequest.order;
    order.orderStatus = updateOrderRequest.orderStatus;
    const orderRegistry = await getAssetRegistry(namespace + '.Order');
    await orderRegistry.update(order);

    // emit the event
    const updateOrderStatusEvent = factory.newEvent(namespace, 'UpdateOrderStatusEvent');
    updateOrderStatusEvent.orderStatus = updateOrderRequest.order.orderStatus;
    updateOrderStatusEvent.order = updateOrderRequest.order;
    emit(updateOrderStatusEvent);
}

// DEMO SETUP FUNCTIONS
/**
 * Create the participants to use in the demo
 * @param {org.acme.vehicle_network.SetupDemo} setupDemo - the SetupDemo transaction
 * @transaction
 */
async function setupDemo() { // eslint-disable-line no-unused-vars
    console.log('setupDemo');

    const factory = getFactory();
    const namespace = 'org.acme.vehicle_network';

    let people = ['Paul', 'Andy', 'Hannah', 'Sam', 'Caroline', 'Matt', 'Fenglian', 'Mark', 'James', 'Dave', 'Rob', 'Kai', 'Ellis', 'LesleyAnn'];
    let manufacturers;

    const vehicles = {
        'Arium': {
            'Nova': [
                {
                    'vin': 'ea290d9f5a6833a65',
                    'colour': 'Royal Purple',
                    'vehicleStatus': 'ACTIVE'
                }
            ],
            'Nebula': [
                {
                    'vin': '39fd242c2bbe80f11',
                    'colour': 'Statement Blue',
                    'vehicleStatus': 'ACTIVE'
                }
            ]
        },
        'Morde': {
            'Putt': [
                {
                    'vin': '835125e50bca37ca1',
                    'colour': 'Black',
                    'vehicleStatus': 'ACTIVE'
                },
                {
                    'vin': '0812e6d8d486e0464',
                    'colour': 'Red',
                    'vehicleStatus': 'ACTIVE'
                },
                {
                    'vin': 'c4aa418f26d4a0403',
                    'colour': 'Silver',
                    'vehicleStatus': 'ACTIVE'
                }
            ],
            'Pluto': [
                {
                    'vin': '7382fbfc083f696e5',
                    'colour': 'White',
                    'vehicleStatus': 'ACTIVE'
                },
                {
                    'vin': '01a9cd3f8f5db5ef7',
                    'colour': 'Green',
                    'vehicleStatus': 'ACTIVE'
                },
                {
                    'vin': '97f305df4c2881e71',
                    'colour': 'Grey',
                    'vehicleStatus': 'ACTIVE'
                }
            ]
        },
        'Ridge': {
            'Cannon': [
                {
                    'vin': 'af462063fb901d0e6',
                    'colour': 'Red',
                    'vehicleStatus': 'ACTIVE'
                },
                {
                    'vin': '3ff3395ecfd38f787',
                    'colour': 'White',
                    'vehicleStatus': 'ACTIVE'
                },
                {
                    'vin': 'de701fcf2a78d8086',
                    'colour': 'Silver',
                    'vehicleStatus': 'ACTIVE'
                }
            ],
            'Rancher': [
                {
                    'vin': '2fcdd7b5131e81fd0',
                    'colour': 'Blue',
                    'vehicleStatus': 'ACTIVE'
                },
                {
                    'vin': '79540e5384c970321',
                    'colour': 'White',
                    'vehicleStatus': 'ACTIVE'
                }
            ]
        }
    };

    // convert array names of people to be array of participant resources of type Person with identifier of that name
    people = people.map(function (person) {
        return factory.newResource(namespace, 'Person', person);
    });

    // create array of Manufacturer particpant resources identified by the top level keys in vehicles const
    manufacturers = Object.keys(vehicles).map(function (manufacturer) {
        const manufacturerResource = factory.newResource(namespace, 'Manufacturer', manufacturer);
        manufacturerResource.name = manufacturer;
        return manufacturerResource;
    });

    // create a Regulator participant resource
    const regulator = factory.newResource(namespace, 'Regulator', 'VDA');
    regulator.name = 'VDA';

    // add the regulator
    const regulatorRegistry = await getParticipantRegistry(namespace + '.Regulator');
    await regulatorRegistry.add(regulator);

    // add the manufacturers
    const manufacturerRegistry = await getParticipantRegistry(namespace + '.Manufacturer');
    await manufacturerRegistry.addAll(manufacturers);

    // add the persons
    const personRegistry = await getParticipantRegistry(namespace + '.Person');
    await personRegistry.addAll(people);

    // add the vehicles
    const vehicleRegistry = await getAssetRegistry(namespace + '.Vehicle');
    const vehicleResources = [];

    for (const manufacturer in vehicles) {
        for (const model in vehicles[manufacturer]) {
            const vehicconstemplatesForModel = vehicles[manufacturer][model];
            vehicconstemplatesForModel.forEach(function(vehicconstemplate) {
                const vehicle = factory.newResource(namespace, 'Vehicle', vehicconstemplate.vin);
                vehicle.owner = people[vehicleResources.length+1];
                vehicle.vehicleStatus = vehicconstemplate.vehicleStatus;
                vehicle.vehicleDetails = factory.newConcept(namespace, 'VehicleDetails');
                vehicle.vehicleDetails.make = factory.newResource(namespace, 'Manufacturer', manufacturer);
                vehicle.vehicleDetails.modelType = model;
                vehicle.vehicleDetails.colour = vehicconstemplate.colour;

                vehicleResources.push(vehicle);
            });
        }
    }
    await vehicleRegistry.addAll(vehicleResources);
}