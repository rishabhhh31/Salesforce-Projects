import { LightningElement, api } from 'lwc';

export default class CustomModalDatatable extends LightningElement {
    @api contactId;
    @api isEdit;
    edited = false;
    closeModalHandler() {
        let isEdit = this.edited;
        this.dispatchEvent(new CustomEvent('close', { detail: { edited: isEdit } }));
    }

    successHandler() {
        this.edited = true;
        this.closeModalHandler();
    }

    get modalTitle() {
        return 'Contact ' + (this.isEdit ? 'Edit' : 'View');
    }
}