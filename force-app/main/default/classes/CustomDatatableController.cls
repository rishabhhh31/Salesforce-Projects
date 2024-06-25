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

    @AuraEnabled(cacheable=true)
    public static List<ContactWrapper> getContactRelatedAccountWrapper(String accId){
        try {
            List<ContactWrapper> contactWrapperList = new List<ContactWrapper>();
            List<Contact> contactList = [SELECT FirstName, LastName, Title, Email, Phone, LeadSource, (SELECT Id FROM Cases) FROM Contact WHERE AccountId =: accId];
            for(Contact con : contactList){
                ContactWrapper cw = new ContactWrapper();
                cw.Id = con.Id; 
                cw.FirstName = con.FirstName; 
                cw.LastName = con.LastName; 
                cw.Title = con.Title; 
                cw.Email = con.Email; 
                cw.Phone = con.Phone;
                cw.LeadSource = con.LeadSource; 
                cw.isBadContact = (con.LeadSource == 'Phone Inquiry' && con.Phone == null); 
                cw.noOfCase = con.Cases.size();
                contactWrapperList.add(cw);
            }
            return contactWrapperList;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    class ContactWrapper{
        @AuraEnabled
        public String Id;

        @AuraEnabled
        public String FirstName;
        
        @AuraEnabled
        public String LastName;

        @AuraEnabled
        public String Title;

        @AuraEnabled
        public String Email;

        @AuraEnabled
        public String Phone;

        @AuraEnabled
        public String LeadSource;

        @AuraEnabled
        public Boolean isBadContact;

        @AuraEnabled
        public Integer noOfCase;
    }
}