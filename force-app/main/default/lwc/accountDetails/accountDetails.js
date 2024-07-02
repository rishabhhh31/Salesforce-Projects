import { LightningElement, wire } from 'lwc';
import getContacts from '@salesforce/apex/AccountContactHandler.getContacts';
import CONTACT_OBJECT from "@salesforce/schema/Contact";
import {
    subscribe,
    unsubscribe,
    APPLICATION_SCOPE,
    MessageContext,
} from "lightning/messageService";
import accountContact from "@salesforce/messageChannel/accountContact__c";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from "@salesforce/apex";
import { deleteRecord } from 'lightning/uiRecordApi';

export default class AccountDetails extends LightningElement {
    objectApiName = CONTACT_OBJECT;
    subscription = null;
    showModal = false;
    account = null;
    title = 'Contact';
    contacts = [];
    accountId = '';
    contactId = '';
    contactResult;
    modalTitle = '';

    @wire(MessageContext)
    messageContext;

    @wire(getContacts, { accId: '$accountId' })
    wiredContacts(result) {
        this.contactResult = result;
        if (result.data) {
            this.contacts = result.data;
        } else if (result.error) {
            console.log(result.error);
        }
    }

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                accountContact,
                (message) => this.handleMessage(message),
                { scope: APPLICATION_SCOPE },
            );
        }
    }

    handleMessage(message) {
        this.account = message.account;
        this.accountId = this.account.Id;
        this.title = this.account.Name + "'s Contacts";
    }

    get accountAvailable() {
        return this.account != null;
    }

    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    get showDetails() {
        return this.contacts.length > 0;
    }

    closeHandler() {
        this.showModal = false;
    }

    newContactHandler() {
        this.modalTitle = 'New Contact'
        this.contactId = '';
        this.showModal = true;
    }

    editContactHandler(event) {
        this.modalTitle = 'Edit Contact'
        this.contactId = event.target.dataset.recordId;
        this.showModal = true;
    }

    deleteContact(event) {
        this.deleteContactHandler(event.target.dataset.recordId);
    }

    async successHandler() {
        this.showModal = false;
        await refreshApex(this.contactResult);
        let message = this.modalTitle.includes('New') ? 'Contact created successfully' : 'Contact edited successfully';
        this.showToastMessage(message, '', 'success')
    }

    showToastMessage(title, message, variant) {
        const evt = new ShowToastEvent({
            title, message, variant
        });
        this.dispatchEvent(evt);
    }

    async deleteContactHandler(conId) {
        try {
            await deleteRecord(conId);
            await refreshApex(this.contactResult);
            this.dispatchEvent(
                this.showToastMessage('Contact deleted', '', 'success')
            );
        } catch (error) {
            this.showToastMessage('Error deleting record', error.body.message, 'error')
        }
    }
}