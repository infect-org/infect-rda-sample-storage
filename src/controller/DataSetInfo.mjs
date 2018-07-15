'use strict';


import {Controller} from 'rda-service';
import type from 'ee-types';
import log from 'ee-log';




export default class DataSetInfoController extends Controller {


    constructor({db}) {
        super('dataset-info');

        this.db = db;

        this.enableAction('listOne');
    }






    /**
    * return information about the requirements of the data set
    * such as memory requirements and record couunt
    */
    async listOne(request, response) {
        const dataSetIdentifier = request.params.id;

        
        // count the records to be loaded
        const recordCount = await this.db.data('id')
            .getDataVersion()
            .fetchDataVersionStatus({
                identifier: 'active'
            })
            .getDataSet({
                identifier: dataSetIdentifier
            })
            .count();

        const memoryPerRow = await this.getDataSetMemoryRequirements(dataSetIdentifier);
        
        return {
            recordCount,
            memoryPerRow,
            totalMemory: recordCount*memoryPerRow
        };
    }





    /**
    * compute the memory requirements for the data set
    */
    async getDataSetMemoryRequirements(dataSetIdentifier) {
        const dbDefinition = this.db.data.getDefinition();
        

        // get fields that are part of the data set
        const fields = (await this.db.dataSetField('*').getDataSet({
            identifier: dataSetIdentifier
        }).raw().find()).map(row => row.fieldName);


        if (fields.length) {

            // memory requirements of items in the v8 heap:
            // empty object:                    56 bytes
            // non empty object without data:   24 bytes
            // date object:                     100 bytes
            // number:                          8 bytes
            // boolean:                         8 byte
            // string:                          length*2 bytes (and probably more for utf 8 characters

            // memory for a non empty object
            let memoryPerRecords = 24;


            for (const fieldName of fields) {
                if (dbDefinition.columns[fieldName]) {
                    switch (dbDefinition.columns[fieldName].jsTypeMapping) {
                        case 'number':
                        case 'date':
                        case 'boolean':
                            memoryPerRecords += 8;
                            break;

                        case 'string':
                            const len = await this.getTextFieldWidth(fieldName);
                            memoryPerRecords += len*2;
                            break;

                        default: 
                            throw new Error(`Cannot estimate memory consumption for field '${fieldName}' on data set '${dataSetIdentifier}' with the type '${dbDefinition.columns[fieldName].jsTypeMapping}'!`);
                    }
                } else throw new Error(`Failed to estimate memory for data set '${dataSetIdentifier}': the field '${fieldName}' specified in the dataSetField table does not exist on the data table in the database!`);
            }


            return memoryPerRecords;
        } else throw new Error(`Faield to laod data set fields for the data set ${dataSetIdentifier}! Were they added for the dataset?`);
    }




    /**
    * loads the average length for the text fields of the data set
    */
    async getTextFieldWidth(columnName) {
        const Related = this.db.getORM();
        const result = await this.db.data([Related.avg(Related.len(columnName), 'len')]).raw().find();
        return Math.ceil(result[0].len);
    }
}