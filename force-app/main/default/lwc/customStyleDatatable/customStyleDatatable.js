import { LightningElement, wire } from 'lwc';
import getContacts from '@salesforce/apex/CustomDatatableController.getContacts';
const COLUMN = [
    {
        label: 'Contact Name', type: 'customName', typeAttributes: {
            contactName: { fieldName: "Name" },
        }
    },
    {
        label: 'Account Name', type: 'url', fieldName: 'accountLink', typeAttributes: {
            label: { fieldName: 'accountName' },
            target: '_blank'
        }
    },
    {
        label: 'Title', fieldName: 'Title', type: 'text', cellAttributes: {
            class: 'slds-text-color_success'
        }
    },
    {
        label: 'Rank', fieldName: 'Rank__c', type: 'customRank', typeAttributes: {
            rankIcon: { fieldName: 'rankIcon' }
        }
    },
    { label: 'Phone', fieldName: 'Phone', type: 'phone' },
    { label: 'Email', fieldName: 'Email', type: 'email' },
    {
        label: 'Contact Picture', type: 'customImage', typeAttributes: {
            contactPicture: { fieldName: 'Picture__c' },
        }, cellAttributes: {
            alignment: 'center'
        }
    },
]
export default class CustomStyleDatatable extends LightningElement {
    contacts = [];
    columns = COLUMN;
    @wire(getContacts)
    getContactsDatatable({ data, error }) {
        if (data) {
            this.contacts = data.map(con => {
                let accountLink = '';
                let accountName = '';
                if (con.AccountId != null) {
                    accountLink = `/${con.AccountId}`;
                    accountName = con.Account.Name;
                }
                let rankIcon = con.Rank__c > 5 ? 'utility:ribbon' : '';
                return { ...con, rankIcon, accountLink, accountName };
            });
        } else if (error) {
            console.log(error);
        }
    }
}