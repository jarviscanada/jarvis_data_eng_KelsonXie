public with sharing class TeacherCourseController {
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getCoursesWithStudents(Id teacherId) {
        List<Map<String, Object>> result = new List<Map<String, Object>>();

        List<Course__c> courses = [
            SELECT Id, Name, Course_Code__c,
            (SELECT Id, Student__r.Name, Student__r.Email__c, 
                    Term__c, Grade_Points__c, Letter_Grade__c, Status__c 
             FROM Enrollments__r)
            FROM Course__c
            WHERE Teacher__c = :teacherId
        ];

        for (Course__c course : courses) {
            Map<String, Object> courseMap = new Map<String, Object>();
            courseMap.put('Id', course.Id);
            courseMap.put('Name', course.Name);

            List<Map<String, Object>> students = new List<Map<String, Object>>();
            for (Enrollment__c e : course.Enrollments__r) {
                Map<String, Object> studentMap = new Map<String, Object>();
                studentMap.put('Id', e.Id);
                studentMap.put('studentName', e.Student__r.Name);
                studentMap.put('studentEmail', e.Student__r.Email__c);
                studentMap.put('term', e.Term__c);
                studentMap.put('gradePoints', e.Grade_Points__c);
                studentMap.put('letterGrade', e.Letter_Grade__c);
                studentMap.put('status', e.Status__c);
                students.add(studentMap);
            }
            courseMap.put('students', students);
            result.add(courseMap);
        }
        return result;
    }
}