public with sharing class LeaveTrackerHandler {
    @AuraEnabled(cacheable=true)
    public static List<Leave_Tracker__c> getMyLeaves(){
        try {
            List<Leave_Tracker__c> leaveList = [SELECT Id, Name, Status__c, From_Date__c, To_Date__c, Reason__c FROM Leave_Tracker__c WHERE User__c =: UserInfo.getUserId() ORDER BY CreatedDate DESC];
            return leaveList;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled(cacheable=true)
    public static List<Leave_Tracker__c> getSubOrdinateRequests(){
        try {
            List<Leave_Tracker__c> leaveList = [SELECT Id, User__r.Username, Manager_Comment__c, Name, Status__c, From_Date__c, To_Date__c, Reason__c FROM Leave_Tracker__c WHERE User__r.ManagerId =: UserInfo.getUserId() ORDER BY CreatedDate DESC];
            return leaveList;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}