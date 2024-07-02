import { LightningElement } from 'lwc';

export default class AccountContactManagement extends LightningElement {
    accounts = [];
    showTableHandler(event) {
        this.accounts = event.detail;
    }
}