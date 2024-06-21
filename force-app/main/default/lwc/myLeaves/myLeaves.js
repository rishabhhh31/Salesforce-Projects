import { LightningElement, wire } from 'lwc';
import getMyLeaves from '@salesforce/apex/LeaveTrackerHandler.getMyLeaves';
import LEAVE_TRACKER from "@salesforce/schema/Leave_Tracker__c";
import NAME_FIELD from "@salesforce/schema/Leave_Tracker__c.Name";
import FROM_DATE_FIELD from "@salesforce/schema/Leave_Tracker__c.From_Date__c";
import TO_DATE_FIELD from "@salesforce/schema/Leave_Tracker__c.To_Date__c";
import REASON_FIELD from "@salesforce/schema/Leave_Tracker__c.Reason__c";
import STATUS_FIELD from "@salesforce/schema/Leave_Tracker__c.Status__c";
import USER_FIELD from "@salesforce/schema/Leave_Tracker__c.User__c";
import Id from "@salesforce/user/Id";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

const COLUMNS = [
    {
        label: 'Request Id', fieldName: 'Name', cellAttributes: {
            class: {
                fieldName: 'cellClass'
            }
        }
    },
    {
        label: 'From Date', fieldName: 'From_Date__c', type: 'date', cellAttributes: {
            class: {
                fieldName: 'cellClass'
            }
        }
    },
    {
        label: 'To Date', fieldName: 'To_Date__c', type: 'date', cellAttributes: {
            class: {
                fieldName: 'cellClass'
            }
        }
    },
    {
        label: 'Reason', fieldName: 'Reason__c', cellAttributes: {
            class: {
                fieldName: 'cellClass'
            }
        }
    },
    {
        label: 'Status', fieldName: 'Status__c', cellAttributes: {
            class: {
                fieldName: 'cellClass'
            }
        }
    },
    {
        label: '', fieldName: 'Status__c', type: 'button', typeAttributes: {
            label: 'Edit',
            variant: 'bare',
            disabled: {
                fieldName: 'isDisabled'
            }
        }
    }
]
const fieldNames = [NAME_FIELD, FROM_DATE_FIELD, TO_DATE_FIELD, REASON_FIELD, STATUS_FIELD, USER_FIELD];
const fieldApiNames = fieldNames.map(field => field.fieldApiName);
export default class MyLeaves extends LightningElement {
    userId = Id;
    objectApiName = LEAVE_TRACKER;
    columns = COLUMNS;
    myLeaves = [];
    showModal = false;
    name;
    fromDate;
    toDate;
    reason;
    status;
    user;
    recordId;
    myLeavesResult;
    connectedCallback() {
        [this.name, this.fromDate, this.toDate, this.reason, this.status, this.user] = fieldApiNames;
    }
    @wire(getMyLeaves)
    wireMyLeaves(result) {
        this.myLeavesResult = result;
        if (result.data) {
            this.myLeaves = result.data.map(d => {
                let isDisabled = d.Status__c != 'Pending';
                let cellClass = '';
                if (d.Status__c == 'Approved') {
                    cellClass = 'slds-theme_success'
                } else if (d.Status__c == 'Rejected') {
                    cellClass = 'slds-theme_warning'
                }
                return { ...d, isDisabled, cellClass };
            });
        } else if (result.error) {
            console.log(result.error);
        }
    }

    applyLeaveHandler() {
        this.recordId = null;
        this.showModal = true;
    }

    handleRowAction(event) {
        this.recordId = event.detail.row.Id;
        this.showModal = true;
    }

    closeHandler() {
        this.showModal = false;
    }

    successHandler() {
        refreshApex(this.myLeavesResult);
        this.showModal = false;
        this.showToast('Success', 'success', 'Request created successfully.');
        this.dispatchEvent(new CustomEvent('subordinate', { bubbles: true }));
    }

    submitHandler(event) {
        event.preventDefault();
        let fields = { ...event.detail.fields };
        if (new Date(fields.From_Date__c) > new Date(fields.To_Date__c)) {
            this.showToast('Error', 'error', 'To date must be after from date.');
            return;
        }
        if (new Date(fields.From_Date__c) < new Date()) {
            this.showToast('Error', 'error', 'From date must be greater than or equal to today date.');
            return;
        }
        fields[STATUS_FIELD.fieldApiName] = 'Pending';
        this.refs.leaveReqeustFrom.submit(fields);
    }

    showToast(title, variant, message) {
        const event = new ShowToastEvent({
            title: title,
            variant: variant,
            message: message
        });
        this.dispatchEvent(event);
    }
}