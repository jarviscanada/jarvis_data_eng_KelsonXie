public with sharing class QuickEnrollController {
    @AuraEnabled(cacheable=true)
    public static List<Course__c> getAvailableCourses(Id studentId) {
        // Get courses the student is already enrolled in
        Set<Id> enrolledCourseIds = new Set<Id>();
        for (Enrollment__c e : [SELECT Course__c FROM Enrollment__c WHERE Student__c = :studentId AND Status__c != 'Withdrawn']) {
            enrolledCourseIds.add(e.Course__c);
        }

        // Return courses not already enrolled in
        return [
            SELECT Id, Name, Course_Code__c, Department__c, Credits__c, Teacher__r.Name
            FROM Course__c
            WHERE Id NOT IN :enrolledCourseIds
            ORDER BY Name
        ];
    }

    @AuraEnabled
    public static void enrollStudent(Id studentId, Id courseId, String term) {
        // Check for existing enrollment
        List<Enrollment__c> existing = [
            SELECT Id FROM Enrollment__c
            WHERE Student__c = :studentId
            AND Course__c = :courseId
            AND Status__c != 'Withdrawn'
        ];

        if (!existing.isEmpty()) {
            throw new AuraHandledException('Student is already enrolled in this course.');
        }

        // Get course name for enrollment name
        Course__c course = [SELECT Name FROM Course__c WHERE Id = :courseId];
        Student__c student = [SELECT Name FROM Student__c WHERE Id = :studentId];

        Enrollment__c enrollment = new Enrollment__c(
            Name = student.Name + ' - ' + course.Name,
            Student__c = studentId,
            Course__c = courseId,
            Term__c = term,
            Status__c = 'Enrolled'
        );
        insert enrollment;
    }
}