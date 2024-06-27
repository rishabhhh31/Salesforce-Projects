import { LightningElement, wire } from 'lwc';
import {
    subscribe,
    unsubscribe,
    APPLICATION_SCOPE,
    MessageContext,
} from 'lightning/messageService';
import crickerter from '@salesforce/messageChannel/cricketer__c';
import { NavigationMixin } from 'lightning/navigation';

export default class PlayerDetailCard extends NavigationMixin(LightningElement) {
    subscription = null;
    player;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                crickerter,
                (message) => this.handleMessage(message),
                { scope: APPLICATION_SCOPE }
            );
        }
    }

    handleMessage(message) {
        this.player = message.selectedPlayer;
    }

    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    get playerAvaiable() {
        return this.player != null;
    }

    openPlayerDetails() {
        this[NavigationMixin.Navigate](
            {
                type: 'standard__recordPage',
                attributes: {
                    recordId: this.player.Id,
                    objectApiName: 'Cricketer__c',
                    actionName: 'view'
                }
            });
    }

    get selectedPlayerTitle() {
        return this.player ? this.player.Name : 'Select Player';
    }
}