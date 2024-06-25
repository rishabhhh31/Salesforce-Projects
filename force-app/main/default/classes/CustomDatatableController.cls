public with sharing class CustomDatatableController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContacts(){
        try {
            return [SELECT Id, AccountId, Account.Name, Name, Rank__c, Phone, Picture__c, Title, Email from Contact ORDER BY Name];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContactRelatedAccount(String accId){
        try {
            System.debug(accId);
            return [SELECT FirstName, LastName, Title, Email, Phone, LeadSource FROM Contact WHERE AccountId =: accId];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}