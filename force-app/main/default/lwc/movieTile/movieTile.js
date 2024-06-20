import { LightningElement, api } from 'lwc';

export default class MovieTile extends LightningElement {
    @api movie;
    @api selectedMovie;

    selectedMovieHandler() {
        const evt = new CustomEvent('selected', { detail: this.movie.imdbID });
        this.dispatchEvent(evt);
    }

    get selectedTile() {
        return this.selectedMovie == this.movie.imdbID ? 'selected' : '';
    }
}