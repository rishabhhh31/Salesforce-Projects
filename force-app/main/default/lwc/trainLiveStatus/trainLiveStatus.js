import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getTrainStatus from '@salesforce/apex/CheckTrainStatus.getTrainStatus';
import { publish, MessageContext } from 'lightning/messageService';
import mapLocations from '@salesforce/messageChannel/stationLocationChannel__c';
const COLUMNS = [
    { label: 'Station Name', fieldName: 'station_name' },
    { label: 'Distance', fieldName: 'distance' },
    { label: 'Delay', fieldName: 'delay' },
    { label: 'Actual Time', fieldName: 'actualTime' },
    { label: 'Expected Time', fieldName: 'expectedTime' },
    { label: 'Platform No.', fieldName: 'platform' },
    { label: 'Halt', fieldName: 'halt' },
]

export default class TrainLiveStatus extends LightningElement {
    columns = COLUMNS;
    trainName = '';
    errorMessage = '';
    lastUpdates = '';
    trainNumber = '';
    trainStatus = [];
    loading = false;
    timeout;
    mapMarkers = [];

    @wire(MessageContext)
    messageContext;

    handleChange(event) {
        this.trainNumber = event.target.value;
    }

    async checkStatus() {
        if (this.trainNumber.length == 0) {
            this.showToast('TRAIN NUMBER', 'error', 'Please enter train number')
            return;
        }
        const pattern = /^\d+$/;
        if (!pattern.test(this.trainNumber)) {
            return;
        }

        this.trainName = '';
        this.errorMessage = '';
        this.lastUpdates = '';
        this.trainStatus = [];
        this.loading = true;
        try {
            let data = await getTrainStatus({ trainNumber: this.trainNumber });
            let count = 0;
            let trainData = JSON.parse(data);
            this.trainName = trainData.train_name;
            this.lastUpdates = trainData.updated_time;
            this.trainStatus = trainData.data.map(train => {
                count++;
                let actualTime = '';
                let expectedTime = train.timing.substring(0, 5);
                if (train.timing.includes(':')) {
                    if (train.timing.length > 5) {
                        actualTime = train.timing.substring(5, 10);
                    } else {
                        actualTime = expectedTime;
                    }
                } else {
                    expectedTime = train.timing;
                    actualTime = train.timing;
                }
                return { ...train, Id: count, expectedTime, actualTime };
            });
        } catch (error) {
            this.errorMessage = error.body.message;
        }
        this.loading = false;
    }

    get showTrainName() {
        return (this.trainName.length > 0 && this.lastUpdates.length > 0);
    }

    get isError() {
        return this.errorMessage.length > 0;
    }

    showToast(title, variant, message) {
        const event = new ShowToastEvent({
            title, variant, message
        });
        this.dispatchEvent(event);
    }

    handleRowSelection(event) {
        this.mapMarkers = event.detail.selectedRows.map(row => {
            let obj = {};
            obj.location = {};
            obj.location.Street = row.station_name + " Railway Station";
            obj.location.Country = 'India';
            obj.title = row.station_name + " Railway Station";
            return obj;
        })
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            publish(this.messageContext, mapLocations, { locations: this.mapMarkers, trainNumber: this.trainNumber });
        }, 1000);
    }
}