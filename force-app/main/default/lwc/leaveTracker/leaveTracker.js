import { LightningElement } from 'lwc';

export default class LeaveTracker extends LightningElement {
    refreshLeaveHandler(event) {
        event.preventDefault();
        this.refs.myLeavesComp.refreshLeaves();
    }
}