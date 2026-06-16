import { LightningElement, api, wire, track } from 'lwc';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import FORM_FACTOR from '@salesforce/client/formFactor';

export default class StudentCourseGrades extends LightningElement {
    @api recordId;
    @track isModalOpen = false;
    @track selectedEnrollmentId;
    @track selectedGradePoints;
    @track selectedStatus;
    wiredEnrollmentsResult;

    // Detect mobile
    get isMobile() {
        return FORM_FACTOR === 'Small';
    }

    columns = [
        { label: 'Enrollment Name', fieldName: 'Name' },
        { label: 'Term', fieldName: 'Term__c' },
        { label: 'Grade Points', fieldName: 'Grade_Points__c', type: 'number' },
        { label: 'Letter Grade', fieldName: 'Letter_Grade__c' },
        { label: 'Status', fieldName: 'Status__c' },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [{ label: 'Edit', name: 'edit' }]
            }
        }
    ];

    statusOptions = [
        { label: 'Enrolled', value: 'Enrolled' },
        { label: 'Completed', value: 'Completed' },
        { label: 'Withdrawn', value: 'Withdrawn' },
        { label: 'Incomplete', value: 'Incomplete' }
    ];

    @wire(getRelatedListRecords, {
        parentRecordId: '$recordId',
        relatedListId: 'Enrollments__r',
        fields: ['Enrollment__c.Name', 'Enrollment__c.Term__c', 'Enrollment__c.Grade_Points__c', 'Enrollment__c.Letter_Grade__c', 'Enrollment__c.Status__c']
    })
    wiredEnrollments(result) {
        this.wiredEnrollmentsResult = result;
        this.enrollments = result;
    }

    enrollments;

    get tableData() {
        return this.enrollments?.data?.records.map(record => ({
            Id: record.id,
            Name: record.fields.Name.value,
            Term__c: record.fields.Term__c.value,
            Grade_Points__c: record.fields.Grade_Points__c.value,
            Letter_Grade__c: record.fields.Letter_Grade__c.value,
            Status__c: record.fields.Status__c.value,
            statusClass: `status-${record.fields.Status__c.value?.toLowerCase()}`
        }));
    }

    handleRowAction(event) {
        const row = event.detail.row;
        this.selectedEnrollmentId = row.Id;
        this.selectedGradePoints = row.Grade_Points__c;
        this.selectedStatus = row.Status__c;
        this.isModalOpen = true;
    }

    handleMobileEdit(event) {
        this.selectedEnrollmentId = event.target.dataset.id;
        this.selectedGradePoints = event.target.dataset.grade;
        this.selectedStatus = event.target.dataset.status;
        this.isModalOpen = true;
    }

    handleGradeChange(event) {
        this.selectedGradePoints = event.detail.value;
    }

    handleStatusChange(event) {
        this.selectedStatus = event.detail.value;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    saveEnrollment() {
        const fields = {
            Id: this.selectedEnrollmentId,
            Grade_Points__c: parseFloat(this.selectedGradePoints),
            Status__c: this.selectedStatus
        };

        updateRecord({ fields })
            .then(() => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'Enrollment updated successfully',
                    variant: 'success'
                }));
                this.isModalOpen = false;
                return refreshApex(this.wiredEnrollmentsResult);
            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: error.body.message,
                    variant: 'error'
                }));
            });
    }
}