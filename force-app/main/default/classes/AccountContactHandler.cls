public with sharing class AccountContactHandler {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccount(String accName){
        try {
            String query = 'SELECT Id, Name, Rating, Industry, AnnualRevenue FROM Account';
            if(!String.isBlank(accName)){
                query+=' WHERE Name LIKE : accName';
            }
            query+=' ORDER BY Name, Id';
            return Database.query(query);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContacts(String accId){
        try {
            return [SELECT Name FROM Contact WHERE AccountId =: accId AND AccountId != null ORDER BY Name];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}