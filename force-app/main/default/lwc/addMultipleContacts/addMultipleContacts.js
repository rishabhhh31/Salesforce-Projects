import { LightningElement, api, wire } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import GENDER_FIELD from "@salesforce/schema/Contact.GenderIdentity";
import { getPicklistValues, getObjectInfo } from "lightning/uiObjectInfoApi";
import CONTACT_OBJECT from "@salesforce/schema/Contact";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import insertMultipleContacts from '@salesforce/apex/AddMultipleContact.insertMultipleContacts';

export default class AddMultipleContacts extends LightningElement {
    @api recordId;
    isLoading = false;
    genderPicklistSet = [];

    @wire(getObjectInfo, { objectApiName: CONTACT_OBJECT })
    contactObjectInfo;

    @wire(getPicklistValues, { recordTypeId: "$contactObjectInfo.data.defaultRecordTypeId", fieldApiName: GENDER_FIELD })
    genderPicklist({ data, error }) {
        if (data) {
            this.genderPicklistSet = data.values.map(d => {
                let { label, value } = d;
                return { label, value };
            })
        } else if (error) {
            console.log(error);
        }
    }

    contactCount = [
        { tempId: Date.now() }
    ]

    closeHandler() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }

    async submitHandler() {
        this.isLoading = true;
        if (!this.checkValidity()) {
            this.isLoading = false;
            return;
        }
        this.contactCount.forEach(con => {
            con.AccountId = this.recordId;
        });
        let response = await insertMultipleContacts({ contacts: this.contactCount });
        if (response == 'success') {
            this.showToast('Success', 'Contact inserted successfully', 'success');
        }
        this.isLoading = false;
        this.closeHandler();
    }

    checkValidity() {
        let inputFields = [...this.template.querySelectorAll('lightning-input')];
        const allValid = inputFields.reduce((validSoFar, inputCmp) => {
            inputCmp.reportValidity();
            return validSoFar && inputCmp.checkValidity();
        }, true);
        return allValid;
    }

    addContactHandler() {
        let newCount = [...this.contactCount];
        newCount.push({ tempId: Date.now() });
        this.contactCount = [...newCount];
    }

    deleteContactHandler(event) {
        if (this.contactCount.length == 1) {
            this.showToast('Error', 'Cannot delete last row.', 'error');
            return;
        }
        let tempId = event.target.dataset.tempId;
        let newCount = this.contactCount.filter(con => {
            return con.tempId != tempId;
        })
        this.contactCount = [...newCount];
    }

    get showContactsList() {
        return this.genderPicklistSet.length > 0;
    }

    contactChangeHandler(event) {
        let conTemp = event.target.dataset.tempId;
        let field = event.target.name;
        let value = event.target.value;
        let selectedContact = this.contactCount.find(con => {
            return con.tempId == conTemp;
        })
        selectedContact[field] = value;
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title, message, variant
        });
        this.dispatchEvent(evt);
    }
}