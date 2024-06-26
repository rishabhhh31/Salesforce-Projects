import { LightningElement, wire } from 'lwc';
import loadAccount from '@salesforce/apex/InfiniteLoadController.loadAccount';
import getInitialAccount from '@salesforce/apex/InfiniteLoadController.getInitialAccount';
import getTotalAccountCount from '@salesforce/apex/InfiniteLoadController.getTotalAccountCount';
const COLUMN = [
    { label: 'Account Id', fieldName: 'Id' },
    { label: 'Account Name', fieldName: 'Name' },
    { label: 'Rating', fieldName: 'Rating' },
    { label: 'Industry', fieldName: 'Industry' },
    { label: 'Active', fieldName: 'Active__c' },
]
export default class InfiniteLoadingDatatable extends LightningElement {
    columns = COLUMN;
    currentCount;
    totalRows;
    accounts = [];
    @wire(getTotalAccountCount)
    totalAccounts({ data, error }) {
        if (data) {
            this.totalRows = data;
        } else if (error) {
            console.log(error);
        }
    }

    @wire(getInitialAccount)
    initialAccount({ data, error }) {
        if (data) {
            this.currentCount = data.length;
            this.accounts = data;
        } else if (error) {
            console.log(error);
        }
    }
    async loadMoreData(event) {
        const { target } = event;
        target.isLoading = true;
        let lastAccount = this.accounts[this.accounts.length - 1];
        let data = await loadAccount({ lastAccId: lastAccount.Id, lastName: lastAccount.Name })
        let newData = [...this.accounts, ...data];
        this.currentCount = newData.length;
        this.accounts = [...newData];
        target.isLoading = false;
    }
}