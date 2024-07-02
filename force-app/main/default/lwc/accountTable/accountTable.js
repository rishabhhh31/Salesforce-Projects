import { LightningElement, api, wire } from 'lwc';
import { publish, MessageContext } from "lightning/messageService";
import accountContact from "@salesforce/messageChannel/accountContact__c";

const COLUMNS = [
    {
        label: 'Account Name', fieldName: 'Name', cellAttributes: {
            alignment: 'center'
        }, hideDefaultActions: true
    },
    {
        label: 'Rating', fieldName: 'Rating', cellAttributes: {
            alignment: 'center'
        }, hideDefaultActions: true
    },
    {
        label: 'Annual Revenue', type: 'currency', fieldName: 'AnnualRevenue', typeAttributes: {
            currencyCode: 'INR'
        }, cellAttributes: {
            alignment: 'center'
        }, hideDefaultActions: true
    },
    {
        label: 'Industry', fieldName: 'Industry', cellAttributes: {
            alignment: 'center'
        }, hideDefaultActions: true
    },
    {
        label: 'Actions', type: 'button', typeAttributes: {
            label: 'View Contacts',
            variant: 'brand-outline',
            title: 'View Contacts',
            name: 'viewContacts'
        }, hideDefaultActions: true
    }
];

export default class AccountTable extends LightningElement {
    @api accounts = [];
    columns = COLUMNS;

    @wire(MessageContext)
    messageContext;

    handleRowAction(event) {
        let account = event.detail.row;
        publish(this.messageContext, accountContact, { account });
    }
    get datatableHeight() {
        if (this.accounts.length > 5) {
            return 'height: 250px;';
        } else {
            return '';
        }
    }
}