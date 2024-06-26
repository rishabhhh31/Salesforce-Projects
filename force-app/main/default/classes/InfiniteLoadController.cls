public with sharing class InfiniteLoadController {
    @AuraEnabled(cacheable=true)
    public static List<Account> getInitialAccount(){
        try {
            return [SELECT Id, Name, Rating, Industry, Active__c from Account ORDER By  Name, Id LIMIT 200];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<Account> loadAccount(String lastAccId, String lastName){
        try {
            return [SELECT Id, Name, Rating, Industry, Active__c from Account WHERE (Name >:lastName) OR ( Name =: lastName AND Id >: lastAccId) ORDER By  Name, Id LIMIT 200];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static Integer getTotalAccountCount(){
        try {
            AggregateResult results = [SELECT COUNT(Id)accCount FROM Account];
            return (Integer) results.get('accCount');
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}