public with sharing class CheckTrainStatus {
    @AuraEnabled    
    public static String getTrainStatus(String trainNumber) {
        HttpRequest req = new HttpRequest();
        req.SetEndPoint('callout:TrainAPI?train_no='+trainNumber);
        req.SetMethod('GET');
        HttpResponse res = new Http().send(req);
        if(res.getStatusCode() == 200){
            return res.getBody();
        }
        throw new AuraHandledException('Please enter correct TRAIN NUMBER');
    }
}