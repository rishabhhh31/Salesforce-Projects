import { LightningElement, api, wire, track } from 'lwc';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from "@salesforce/apex";
import { getObjectInfo, getPicklistValues } from "lightning/uiObjectInfoApi";
import CONTACT_OBJECT from "@salesforce/schema/Contact";
import LEAD_SOURCE from "@salesforce/schema/Contact.LeadSource";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { deleteRecord } from 'lightning/uiRecordApi';
// import getContactRelatedAccount from '@salesforce/apex/CustomDatatableController.getContactRelatedAccount';
import getContactRelatedAccountWrapper from '@salesforce/apex/CustomDatatableController.getContactRelatedAccountWrapper';

const ACTIONS = [
    { label: 'View', name: 'view' },
    { label: 'Edit', name: 'edit' },
    { label: 'Delete', name: 'delete' }
];
const DEFAULT_ACTION = [
    { label: 'All', name: 'All', checked: true }
]
const COLUMN = [
    { label: 'First Name', fieldName: 'FirstName', editable: true, hideDefaultActions: true },
    { label: 'Last Name', fieldName: 'LastName', editable: true, hideDefaultActions: true },
    { label: 'Title', fieldName: 'Title', editable: true, hideDefaultActions: true },
    { label: 'Email', fieldName: 'Email', type: 'email', editable: true, hideDefaultActions: true },
    { label: 'Phone', fieldName: 'Phone', type: 'phone', editable: true, hideDefaultActions: true },
    { label: 'Is Bad Contact', fieldName: 'isBadContact', displayReadOnlyIcon: true, type: 'boolean', hideDefaultActions: true },
    {
        label: 'Total Cases', fieldName: 'noOfCase', displayReadOnlyIcon: true, type: 'number', hideDefaultActions: true, cellAttributes: {
            alignment: 'center'
        }
    },
    {
        label: 'Lead Source', fieldName: 'LeadSource', type: 'customPicklistType', editable: true, typeAttributes: {
            options: { fieldName: 'leadOptions' }
        }, hideDefaultActions: true,
        actions: DEFAULT_ACTION
    },
    { type: 'action', typeAttributes: { rowActions: ACTIONS, menuAlignment: 'auto' } }
]

export default class EditDatatable extends LightningElement {
    @api recordId;
    columns = COLUMN;
    contacts = [];
    draftValues = [];
    contactResult;
    leadSource = [];
    contactRecordType;
    showModal = false;
    contactId;
    isEdit;
    showDatatable = false;
    contactData = [];
    disableBtn = true;
    selectedContacts = [];

    @wire(getObjectInfo, { objectApiName: CONTACT_OBJECT })
    contactObjectInfo({ data, error }) {
        if (data) {
            this.contactRecordType = data.defaultRecordTypeId;
        } else if (error) {
            console.log(error);
        }
    }

    get showTable() {
        return this.showDatatable;
    }

    @wire(getPicklistValues, { recordTypeId: "$contactRecordType", fieldApiName: LEAD_SOURCE })
    picklistResults({ error, data }) {
        if (data) {
            this.leadSource = data.values.map(opt => {
                let { value, label } = opt;
                return { value, label };
            });
            if (this.contactRecordType) {
                this.leadSource.forEach(ld => {
                    DEFAULT_ACTION.push({ label: ld.label, name: ld.value, checked: false });
                })
                this.showDatatable = true;
            }
        } else if (error) {
            console.log(error)
        }
    }

    @wire(getContactRelatedAccountWrapper, { accId: '$recordId', leadSource: '$leadSource' })
    getRelatedContacts(result) {
        this.contactResult = result;
        if (result.data) {
            this.contacts = result.data.map(con => {
                let leadOptions = this.leadSource;
                return { ...con, leadOptions };
            });
            this.contactData = [...this.contacts];
        } else if (result.error) {
            console.log(result.error);
        }
    }

    async handleSave(event) {
        const records = event.detail.draftValues.slice().map((draftValue) => {
            return { fields: draftValue };
        });
        const recordUpdatePromises = records.map(con => updateRecord(con));
        await Promise.all(recordUpdatePromises);;
        await refreshApex(this.contactResult);
        this.draftValues = [];
        this.showToastMessage('Contact Updated', '', 'success');
    }

    async handleRowAction(event) {
        let actionType = event.detail.action.name;
        let contactRow = event.detail.row;
        if (actionType == 'view') {
            this.isEdit = false;
            this.contactId = contactRow.Id;
            this.showModal = true;
        }
        else if (actionType == 'edit') {
            this.isEdit = true;
            this.contactId = contactRow.Id;
            this.showModal = true;
        }
        else if (actionType == 'delete') {
            try {
                await deleteRecord(contactRow.Id);
                await refreshApex(this.contactResult);
                this.showToastMessage('Deleted', 'Contact Deleted Successfully', 'success');
            } catch (error) {
                this.showToastMessage('Error', error?.body?.output?.errors[0]?.message, 'error');
            }
        }
    }

    showToastMessage(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            }),
        );
    }

    async modalCloseHandler(event) {
        if (event.detail.edited) {
            await refreshApex(this.contactResult);
            this.showToastMessage('Contact Updated', '', 'success');
        }
        this.showModal = false;
    }

    handleHeaderAction(event) {
        const actionName = event.detail.action.name;
        let filterContacts = (actionName == 'All') ? [...this.contacts] : this.contacts.filter(con => con.LeadSource == actionName);
        let cols = [...this.columns];
        let selected = cols.find(c => {
            return c.fieldName == 'LeadSource';
        })
        selected.actions.forEach(act => {
            act.checked = (act.name == actionName);
        })
        this.columns = [...cols];
        this.contactData = [...filterContacts];
    }

    handleRowSelection(event) {
        this.disableBtn = !(event.detail.selectedRows.length > 0);
        this.selectedContacts = [...event.detail.selectedRows];
    }

    async deleteContactHandler() {
        if (!this.checkValidity()) {
            this.showToastMessage('Error', 'Contact contains active cases.', 'error')
            return;
        }
        try {
            const deleteContactPromise = this.selectedContacts.map((con) => {
                return deleteRecord(con.Id);
            })
            await Promise.all(deleteContactPromise);
            await refreshApex(this.contactResult);
            this.showToastMessage('Deleted', 'Contacts Deleted Successfully', 'success');
        }
        catch (error) {
            this.showToastMessage('Error', error?.body?.message, 'error');
        }
    }

    checkValidity() {
        const isValid = this.selectedContacts.reduce((valid, con) => {
            return valid && con.noOfCase == 0;
        }, true)
        return isValid;
    }
}