public with sharing class GradeDistributionController {
    @AuraEnabled(cacheable=true)
    public static Map<String, Integer> getGradeDistribution(Id courseId) {
        Map<String, Integer> distribution = new Map<String, Integer>{
            'A' => 0, 'B' => 0, 'C' => 0, 'D' => 0, 'F' => 0
        };

        List<Enrollment__c> enrollments = [
            SELECT Letter_Grade__c 
            FROM Enrollment__c 
            WHERE Course__c = :courseId
            AND Letter_Grade__c != null
        ];

        for (Enrollment__c e : enrollments) {
            if (distribution.containsKey(e.Letter_Grade__c)) {
                distribution.put(e.Letter_Grade__c, distribution.get(e.Letter_Grade__c) + 1);
            }
        }
        return distribution;
    }
}