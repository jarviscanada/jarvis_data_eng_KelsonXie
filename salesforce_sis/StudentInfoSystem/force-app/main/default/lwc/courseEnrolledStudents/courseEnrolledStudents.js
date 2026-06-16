import { LightningElement, api, wire } from 'lwc';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import FORM_FACTOR from '@salesforce/client/formFactor';

export default class CourseEnrolledStudents extends LightningElement {
    @api recordId;

    get isMobile() {
        return FORM_FACTOR === 'Small';
    }

    columns = [
        { label: 'Student Name', fieldName: 'studentName' },
        { label: 'Term', fieldName: 'Term__c' },
        { label: 'Grade Points', fieldName: 'Grade_Points__c', type: 'number' },
        { label: 'Letter Grade', fieldName: 'Letter_Grade__c' },
        { label: 'Status', fieldName: 'Status__c' }
    ];

    @wire(getRelatedListRecords, {
        parentRecordId: '$recordId',
        relatedListId: 'Enrollments__r',
        fields: [
            'Enrollment__c.Student__r.Name',
            'Enrollment__c.Term__c',
            'Enrollment__c.Grade_Points__c',
            'Enrollment__c.Letter_Grade__c',
            'Enrollment__c.Status__c'
        ]
    })
    enrollments;

    get tableData() {
        if (!this.enrollments?.data?.records) return null;
        return this.enrollments.data.records.map(record => ({
            Id: record.id,
            studentName: record.fields.Student__r?.value?.fields?.Name?.value,
            Term__c: record.fields.Term__c.value,
            Grade_Points__c: record.fields.Grade_Points__c.value,
            Letter_Grade__c: record.fields.Letter_Grade__c.value,
            Status__c: record.fields.Status__c.value,
            statusClass: `status-${record.fields.Status__c.value?.toLowerCase()}`
        }));
    }

    get totalEnrolled() {
        return this.tableData ? this.tableData.length : 0;
    }

    get totalCompleted() {
        return this.tableData ? this.tableData.filter(r => r.Status__c === 'Completed').length : 0;
    }

    get averageGrade() {
        if (!this.tableData || this.tableData.length === 0) return 'N/A';
        const withGrades = this.tableData.filter(r => r.Grade_Points__c != null);
        if (withGrades.length === 0) return 'N/A';
        const avg = withGrades.reduce((sum, r) => sum + r.Grade_Points__c, 0) / withGrades.length;
        return avg.toFixed(1);
    }
}