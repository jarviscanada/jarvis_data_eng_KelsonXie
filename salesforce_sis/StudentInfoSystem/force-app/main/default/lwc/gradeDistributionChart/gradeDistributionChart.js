import { LightningElement, api, wire, track } from 'lwc';
import getGradeDistribution from '@salesforce/apex/GradeDistributionController.getGradeDistribution';

export default class GradeDistributionChart extends LightningElement {
    @api recordId;
    @track gradeData;

    @wire(getGradeDistribution, { courseId: '$recordId' })
    wiredGrades({ data, error }) {
        if (data) {
            this.gradeData = data;
        } else if (error) {
            console.error(error);
        }
    }

    get totalStudents() {
        if (!this.gradeData) return 0;
        return Object.values(this.gradeData).reduce((sum, count) => sum + count, 0);
    }

    get classAverage() {
        if (!this.gradeData || this.totalStudents === 0) return 'N/A';
        const gradePoints = { 'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0 };
        let total = 0;
        for (const [grade, count] of Object.entries(this.gradeData)) {
            total += (gradePoints[grade] || 0) * count;
        }
        return (total / this.totalStudents).toFixed(2);
    }

    get topGrade() {
        if (!this.gradeData) return 'N/A';
        let topGrade = 'N/A';
        let topCount = 0;
        for (const [grade, count] of Object.entries(this.gradeData)) {
            if (count > topCount) {
                topCount = count;
                topGrade = grade;
            }
        }
        return topGrade;
    }

    get chartData() {
        if (!this.gradeData || this.totalStudents === 0) return null;
        const colorMap = {
            'A': 'bar bar-a',
            'B': 'bar bar-b',
            'C': 'bar bar-c',
            'D': 'bar bar-d',
            'F': 'bar bar-f'
        };
        return ['A', 'B', 'C', 'D', 'F'].map(grade => {
            const count = this.gradeData[grade] || 0;
            const percent = this.totalStudents > 0
                ? Math.round((count / this.totalStudents) * 100)
                : 0;
            return {
                grade,
                count,
                percent,
                barClass: count === 0 ? 'bar bar-empty' : colorMap[grade],
                barStyle: count === 0 ? 'width: 0%' : `width: ${Math.max(percent, 5)}%`
            };
        });
    }
}