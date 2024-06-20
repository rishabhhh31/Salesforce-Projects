import { LightningElement, wire } from 'lwc';
import getMovieDetails from '@salesforce/apex/MovieSearchHandler.getMovieDetails';
import { publish, MessageContext } from 'lightning/messageService';
import MovieData from '@salesforce/messageChannel/movieData__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class MovieSearch extends LightningElement {
    movieType = '';
    selectedMovieId;
    loading = false;
    errorMessage = '';
    searchText = '';
    timeout;
    movieDetails = [];
    pageNumber = 1;

    typeOptions = [
        { label: 'None', value: '' },
        { label: 'Movie', value: 'movie' },
        { label: 'Series', value: 'series' },
        { label: 'Episode', value: 'episode' },
    ]

    @wire(MessageContext)
    messageContext;

    searchMovieHandler(event) {
        if (event.target.name == 'search') {
            this.searchText = event.target.value;
        }
        else if (event.target.name == 'page') {
            this.pageNumber = event.target.value;
        }
        if (this.searchText != '') {
            this.getMovieAndSeriesDetails();
        }
    }
    typeChangeHandler(event) {
        this.movieType = event.detail.value;
        if (this.searchText != '') {
            this.getMovieAndSeriesDetails();
        }
    }

    getMovieAndSeriesDetails() {
        this.loading = true;
        clearTimeout(this.timeout);
        this.timeout = setTimeout(async () => {
            let response = await getMovieDetails({ movieType: this.movieType, searchKey: this.searchText, pageNumber: this.pageNumber });
            let parsedResponse = JSON.parse(response);
            if (parsedResponse.Response == "True") {
                this.movieDetails = parsedResponse.Search;
                this.errorMessage = '';
            } else if (parsedResponse.Response == "False") {
                this.errorMessage = parsedResponse.Error;
                this.movieDetails = [];
                const event = new ShowToastEvent({
                    title: 'No Movie',
                    message: this.errorMessage,
                    variant: 'error'
                });
                this.dispatchEvent(event);
            }
            this.loading = false;
        }, 1000)
    }

    get showMovieBox() {
        return this.movieDetails.length > 0;
    }

    selectedMovieHandler(event) {
        let selectedMovie = this.movieDetails.find(movie => {
            return movie.imdbID == event.detail;
        })
        this.selectedMovieId = selectedMovie.imdbID;
        if (selectedMovie) {
            publish(this.messageContext, MovieData, { movie: selectedMovie });
        }
    }
}