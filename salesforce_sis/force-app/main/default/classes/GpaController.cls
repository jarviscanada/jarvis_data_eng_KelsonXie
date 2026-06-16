public with sharing class GpaController {
    @AuraEnabled(cacheable=true)
    public static List<Enrollment__c> getStudentEnrollments(Id studentId) {
        return [
            SELECT Id, Name, Term__c, Grade_Points__c, Letter_Grade__c, 
                   Status__c, Course__r.Name, Course__r.Credits__c
            FROM Enrollment__c
            WHERE Student__c = :studentId
        ];
    }
}