public with sharing class CricketerController {
    @AuraEnabled(cacheable=true)
    public static List<Cricketer__C> getAllCricketers(String country){
        try {
            String query = 'SELECT Name, Age__c, Nationality__c, Image_URL__C, Runs__c FROM Cricketer__c';
            if(!String.isBlank(country)){
                query += ' WHERE Nationality__c =:country';
            }
            return Database.query(query);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}