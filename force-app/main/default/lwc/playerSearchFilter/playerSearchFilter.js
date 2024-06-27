import { LightningElement, wire } from 'lwc';
import { getObjectInfo, getPicklistValues } from "lightning/uiObjectInfoApi";
import CRICKETER_OBJECT from "@salesforce/schema/Cricketer__c";
import NATIONALITY_FIELD from "@salesforce/schema/Cricketer__c.Nationality__c";
import { NavigationMixin } from 'lightning/navigation';

export default class PlayerSearchFilter extends NavigationMixin(LightningElement) {
    cricketerRecordTypeId = '';
    nationality = [];
    selectedNationality = '';

    @wire(getObjectInfo, { objectApiName: CRICKETER_OBJECT })
    cricketerObjectInfo({ error, data }) {
        if (data) {
            this.cricketerRecordTypeId = data.defaultRecordTypeId;
        } else if (error) {
            console.error(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: "$cricketerRecordTypeId", fieldApiName: NATIONALITY_FIELD })
    picklistResults({ error, data }) {
        if (data) {
            this.nationality = data.values.map(val => {
                let { value, label } = val;
                return { value, label };
            });

        } else if (error) {
            console.error(error);
        }
    }

    handleNewCricketer() {
        this[NavigationMixin.Navigate](
            {
                type: 'standard__objectPage',
                attributes: {
                    objectApiName: 'Cricketer__c',
                    actionName: 'new'
                }
            });
    }

    handleNationalityChange(event) {
        this.selectedNationality = event.detail.value;
    }
}