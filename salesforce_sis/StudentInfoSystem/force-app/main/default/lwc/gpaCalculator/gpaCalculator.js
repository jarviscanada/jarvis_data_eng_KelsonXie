import { LightningElement, api, wire, track } from 'lwc';
import FORM_FACTOR from '@salesforce/client/formFactor';
import getStudentEnrollments from '@salesforce/apex/GpaController.getStudentEnrollments';

export default class GpaCalculator extends LightningElement {
    @api recordId;
    @track enrollmentData;

    get isMobile() {
        return FORM_FACTOR === 'Small';
    }

    columns = [
        { label: 'Course', fieldName: 'courseName' },
        { label: 'Term', fieldName: 'Term__c' },
        { label: 'Credits', fieldName: 'credits', type: 'number' },
        { label: 'Grade Points', fieldName: 'Grade_Points__c', type: 'number' },
        { label: 'Letter Grade', fieldName: 'Letter_Grade__c' },
        { label: 'Status', fieldName: 'Status__c' }
    ];

    @wire(getStudentEnrollments, { studentId: '$recordId' })
    wiredEnrollments({ data, error }) {
        if (data) {
            this.enrollmentData = data.map(e => ({
                Id: e.Id,
                courseName: e.Course__r?.Name,
                credits: e.Course__r?.Credits__c,
                Term__c: e.Term__c,
                Grade_Points__c: e.Grade_Points__c,
                Letter_Grade__c: e.Letter_Grade__c,
                Status__c: e.Status__c
            }));
        } else if (error) {
            console.error(error);
        }
    }

    get tableData() {
        return this.enrollmentData || [];
    }

    get completedEnrollments() {
        return this.enrollmentData?.filter(e => e.Status__c === 'Completed') || [];
    }

    get totalCourses() {
        return this.enrollmentData?.length || 0;
    }

    get completedCourses() {
        return this.completedEnrollments.length;
    }

    get totalCredits() {
        return this.completedEnrollments.reduce((sum, e) => sum + (e.credits || 0), 0);
    }

    get gpa() {
        const completed = this.completedEnrollments;
        if (completed.length === 0) return '0.00';
        const totalPoints = completed.reduce((sum, e) => sum + (e.Grade_Points__c || 0), 0);
        return (totalPoints / completed.length / 25).toFixed(2);
    }

    get standing() {
        const g = parseFloat(this.gpa);
        if (g >= 3.5) return 'Dean\'s List';
        if (g >= 3.0) return 'Good Standing';
        if (g >= 2.0) return 'Satisfactory';
        if (g >= 1.0) return 'Academic Warning';
        return 'Academic Probation';
    }

    get standingClass() {
        const g = parseFloat(this.gpa);
        if (g >= 3.0) return 'standing-good';
        if (g >= 2.0) return 'standing-warning';
        return 'standing-poor';
    }
}