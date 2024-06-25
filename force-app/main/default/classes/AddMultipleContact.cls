public with sharing class AddMultipleContact {
    @AuraEnabled
    public static string insertMultipleContacts(List<Contact> contacts){
        try {
            insert contacts;
            return 'success';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}