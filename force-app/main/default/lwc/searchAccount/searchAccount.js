import { LightningElement, wire } from 'lwc';
import getAccount from '@salesforce/apex/AccountContactHandler.getAccount';

export default class SearchAccount extends LightningElement {
    title = `Organization's Account And Contact Management`;
    searchKey = '';
    accounts = [];
    timout;
    isLoading = false;

    async connectedCallback() {
        this.accounts = await getAccount({ accName: this.searchKey })
        this.dispatchEvent(new CustomEvent('showtable', { detail: this.accounts }))
    }

    searchAccountHandler(event) {
        try {
            this.isLoading = true;
            this.searchKey = '%' + event.target.value + '%';
            clearTimeout(this.timout);
            this.timout = setTimeout(async () => {
                this.accounts = await getAccount({ accName: this.searchKey })
                this.dispatchEvent(new CustomEvent('showtable', { detail: this.accounts }))
                this.isLoading = false;
            }, 500).bind(this)
        } catch (error) {
            this.accounts = [];
        }
    }
}