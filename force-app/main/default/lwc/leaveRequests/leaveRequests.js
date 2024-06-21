import { LightningElement, api, wire } from 'lwc';
import LEAVE_TRACKER from "@salesforce/schema/Leave_Tracker__c";
import NAME_FIELD from "@salesforce/schema/Leave_Tracker__c.Name";
import FROM_DATE_FIELD from "@salesforce/schema/Leave_Tracker__c.From_Date__c";
import TO_DATE_FIELD from "@salesforce/schema/Leave_Tracker__c.To_Date__c";
import REASON_FIELD from "@salesforce/schema/Leave_Tracker__c.Reason__c";
import STATUS_FIELD from "@salesforce/schema/Leave_Tracker__c.Status__c";
import USER_FIELD from "@salesforce/schema/Leave_Tracker__c.User__c";
import MANAGER_FIELD from "@salesforce/schema/Leave_Tracker__c.Manager_Comment__c";
import getSubOrdinateRequests from '@salesforce/apex/LeaveTrackerHandler.getSubOrdinateRequests';
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
        label: 'User Name', fieldName: 'username', cellAttributes: {
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
        label: 'Manager Comment', fieldName: 'Manager_Comment__c', cellAttributes: {
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
const fieldNames = [NAME_FIELD, FROM_DATE_FIELD, TO_DATE_FIELD, REASON_FIELD, STATUS_FIELD, USER_FIELD, MANAGER_FIELD];
const fieldApiNames = fieldNames.map(field => field.fieldApiName);
export default class LeaveRequests extends LightningElement {
    objectApiName = LEAVE_TRACKER;
    columns = COLUMNS;
    subOrdinateRequests;
    subordinates = [];
    showModal = false;
    name;
    fromDate;
    toDate;
    reason;
    status;
    user;
    managerComment;
    recordId;
    connectedCallback() {
        [this.name, this.fromDate, this.toDate, this.reason, this.status, this.user, this.managerComment] = fieldApiNames;
    }
    @wire(getSubOrdinateRequests)
    wiredSubOrdinateRequests(result) {
        this.subOrdinateRequests = result;
        if (result.data) {
            this.subordinates = result.data.map(d => {
                let isDisabled = d.Status__c != 'Pending';
                let cellClass = '';
                if (d.Status__c == 'Approved') {
                    cellClass = 'slds-theme_success'
                } else if (d.Status__c == 'Rejected') {
                    cellClass = 'slds-theme_warning'
                }
                let username = d.User__r.Username;
                return { ...d, isDisabled, cellClass, username };
            });
        } else if (result.error) {
            console.log(result.error);
        }
    }

    handleRowAction(event) {
        this.recordId = event.detail.row.Id;
        this.showModal = true;
    }

    closeHandler() {
        this.showModal = false;
    }

    successHandler() {
        this.refreshLeaves();
        this.showModal = false;
        this.showToast('Success', 'success', 'Request updated successfully.');
    }

    @api
    refreshLeaves() {
        refreshApex(this.subOrdinateRequests);
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