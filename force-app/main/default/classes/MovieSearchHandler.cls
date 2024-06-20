public with sharing class MovieSearchHandler {
    @AuraEnabled
    public static string getMovieDetails(String movieType, String searchKey, String pageNumber){
        try {
            String apiKey = movie__c.getInstance('apikey').apikey__c;
            HttpRequest req = new HttpRequest();
            req.SetEndPoint('https://www.omdbapi.com/?s='+searchKey+'&type='+movieType+'&page='+pageNumber+'&apikey='+apiKey);
            req.SetMethod('GET');
            HttpResponse res = new Http().send(req);
            if(res.getStatusCode()==200){
                return res.getBody();
            }
            return null;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled
    public static string getMovieDetailById(String movieId){
        try {
            String apiKey = movie__c.getInstance('apikey').apikey__c;
            HttpRequest req = new HttpRequest();
            req.SetEndPoint('https://www.omdbapi.com/?i='+movieId+'&apikey='+apiKey);
            req.SetMethod('GET');
            HttpResponse res = new Http().send(req);
            if(res.getStatusCode()==200){
                return res.getBody();
            }
            return null;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    //http://www.omdbapi.com/?i=tt0944947&apikey=9ec90000
}