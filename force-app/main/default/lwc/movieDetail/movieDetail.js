import { LightningElement, wire } from 'lwc';
import {
    subscribe,
    unsubscribe,
    APPLICATION_SCOPE,
    MessageContext,
} from 'lightning/messageService';
import MovieData from '@salesforce/messageChannel/movieData__c';
import getMovieDetailById from '@salesforce/apex/MovieSearchHandler.getMovieDetailById';

export default class MovieDetail extends LightningElement {
    subscription = null;
    selectedMovie;
    isLoading = false;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                MovieData,
                (message) => this.handleMessage(message),
                { scope: APPLICATION_SCOPE }
            );
        }
    }

    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    async handleMessage(message) {
        this.selectedMovie = null;
        this.isLoading = true;
        let movieId = message.movie.imdbID;
        let response = await getMovieDetailById({ movieId: movieId });
        this.selectedMovie = JSON.parse(response);
        this.isLoading = false;
    }
    get showMovieDetails() {
        return this.selectedMovie != null;
    }
}