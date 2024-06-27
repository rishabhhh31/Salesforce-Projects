import { LightningElement, wire, api, track } from 'lwc';
import getAllCricketers from '@salesforce/apex/CricketerController.getAllCricketers';
import { publish, MessageContext } from 'lightning/messageService';
import crickerter from '@salesforce/messageChannel/cricketer__c';

export default class PlayerSearchResult extends LightningElement {
    @api country = '';
    @track players = [];

    @wire(MessageContext)
    messageContext;

    @wire(getAllCricketers, { country: '$country' })
    getPlayers({ data, error }) {
        if (data) {
            this.players = data;
        } else if (error) {
            console.error(error);
        }
    }

    selectPlayerHandler(event) {
        let selectedPlayerId = event.currentTarget.dataset.playerId;
        let playerCards = this.template.querySelectorAll('.player-card');
        playerCards.forEach(player => {
            if (player.dataset.playerId == selectedPlayerId) {
                player.classList.add('selected');
            } else {
                player.classList.remove('selected');
            }
        })
        let selectedPlayer = this.players.find(player => {
            return player.Id == selectedPlayerId;
        })
        publish(this.messageContext, crickerter, { selectedPlayer });
    }
}