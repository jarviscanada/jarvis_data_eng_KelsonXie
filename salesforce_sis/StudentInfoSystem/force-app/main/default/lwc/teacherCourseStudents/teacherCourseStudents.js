import { LightningElement, api, wire, track } from 'lwc';
import FORM_FACTOR from '@salesforce/client/formFactor';
import getCoursesWithStudents from '@salesforce/apex/TeacherCourseController.getCoursesWithStudents';

export default class TeacherCourseStudents extends LightningElement {
    @api recordId;
    @track courses;
    @track isLoading = true;

    get isMobile() {
        return FORM_FACTOR === 'Small';
    }

    studentColumns = [
        { label: 'Student Name', fieldName: 'studentName' },
        { label: 'Email', fieldName: 'studentEmail' },
        { label: 'Term', fieldName: 'term' },
        { label: 'Grade Points', fieldName: 'gradePoints', type: 'number' },
        { label: 'Letter Grade', fieldName: 'letterGrade' },
        { label: 'Status', fieldName: 'status' }
    ];

    @wire(getCoursesWithStudents, { teacherId: '$recordId' })
    wiredCourses({ data, error }) {
        if (data) {
            this.courses = data.map(course => ({
                ...course,
                students: (course.students || []).map(student => ({
                    ...student,
                    statusClass: `status-${student.status?.toLowerCase()}`
                }))
            }));
            this.isLoading = false;
        } else if (error) {
            console.error(error);
            this.isLoading = false;
        }
    }
}