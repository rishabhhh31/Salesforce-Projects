import { LightningElement } from 'lwc';

export default class LeaveTracker extends LightningElement {
    refreshLeaveHandler() {
        this.refs.myLeavesComp.refreshLeaves();
    }
}