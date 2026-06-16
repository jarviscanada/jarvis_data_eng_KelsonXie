import { LightningElement, api, wire, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getAvailableCourses from '@salesforce/apex/QuickEnrollController.getAvailableCourses';
import enrollStudent from '@salesforce/apex/QuickEnrollController.enrollStudent';

export default class QuickEnroll extends LightningElement {
    @api recordId;
    @track selectedCourseId;
    @track selectedTerm;
    @track showSuccess = false;
    @track successMessage;
    @track courses = [];
    wiredCoursesResult;

    termOptions = [
        { label: 'Fall 2025', value: 'Fall 2025' },
        { label: 'Winter 2026', value: 'Winter 2026' },
        { label: 'Summer 2026', value: 'Summer 2026' },
        { label: 'Fall 2026', value: 'Fall 2026' }
    ];

    @wire(getAvailableCourses, { studentId: '$recordId' })
    wiredCourses(result) {
        this.wiredCoursesResult = result;
        if (result.data) {
            this.courses = result.data;
        } else if (result.error) {
            console.error(result.error);
        }
    }

    get courseOptions() {
        return this.courses.map(c => ({
            label: `${c.Name} — ${c.Department__c} (${c.Credits__c} credits)`,
            value: c.Id
        }));
    }

    get selectedCourse() {
        if (!this.selectedCourseId) return null;
        const course = this.courses.find(c => c.Id === this.selectedCourseId);
        if (!course) return null;
        return {
            ...course,
            teacherName: course.Teacher__r?.Name || 'Not assigned'
        };
    }

    get isEnrollDisabled() {
        return !this.selectedCourseId || !this.selectedTerm;
    }

    handleCourseChange(event) {
        this.selectedCourseId = event.detail.value;
    }

    handleTermChange(event) {
        this.selectedTerm = event.detail.value;
    }

    handleEnroll() {
        enrollStudent({
            studentId: this.recordId,
            courseId: this.selectedCourseId,
            term: this.selectedTerm
        })
        .then(() => {
            const courseName = this.selectedCourse?.Name;
            this.successMessage = `Successfully enrolled in ${courseName} for ${this.selectedTerm}`;
            this.showSuccess = true;
            return refreshApex(this.wiredCoursesResult);
        })
        .catch(error => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Enrollment Failed',
                message: error.body.message,
                variant: 'error'
            }));
        });
    }

    resetForm() {
        this.selectedCourseId = null;
        this.selectedTerm = null;
        this.showSuccess = false;
        this.successMessage = null;
    }
}