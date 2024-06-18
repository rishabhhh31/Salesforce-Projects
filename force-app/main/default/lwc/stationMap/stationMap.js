import { LightningElement, wire } from 'lwc';
import mapLocations from '@salesforce/messageChannel/stationLocationChannel__c';
import {
    subscribe,
    unsubscribe,
    APPLICATION_SCOPE,
    MessageContext,
} from 'lightning/messageService';

export default class StationMap extends LightningElement {
    mapMarkers = [];
    subscription = null;
    markersTitle;
    mapOptions = {
        zoomControl: false
    };

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                mapLocations,
                (response) => this.handleMessage(response),
                { scope: APPLICATION_SCOPE }
            );
        }
    }

    handleMessage(response) {
        this.markersTitle = response.trainNumber + ' Route';
        this.mapMarkers = [...response.locations];
    }

    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    get showMap() {
        return this.mapMarkers.length > 0;
    }
}