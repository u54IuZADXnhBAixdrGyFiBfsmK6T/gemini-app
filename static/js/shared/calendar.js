export class Calendar {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.monthLabel = document.getElementById(options.monthLabelId || 'calendarMonth');
        this.yearLabel = document.getElementById(options.yearLabelId || 'calendarYear');
        
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.markedDates = []; 
        
        this.onDateSelect = options.onDateSelect || (() => {});
        this.onMonthChange = options.onMonthChange || (() => {});
        
        this.init();
    }

    init() {
        this.render();
    }

    render() {
        if (!this.container) return;
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        if (this.monthLabel) this.monthLabel.textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long' });
        if (this.yearLabel) this.yearLabel.textContent = year;
        
        this.container.innerHTML = '';
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const prevLastDay = new Date(year, month, 0);
        
        const firstDayOfWeek = firstDay.getDay();
        const lastDate = lastDay.getDate();
        const prevLastDate = prevLastDay.getDate();
        
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            this.createDayElement(prevLastDate - i, true);
        }
        
        for (let day = 1; day <= lastDate; day++) {
            this.createDayElement(day, false);
        }
        
        const totalCells = this.container.children.length;
        const remainingCells = 42 - totalCells;
        for (let day = 1; day <= remainingCells; day++) {
            this.createDayElement(day, true);
        }
    }

    createDayElement(day, isOtherMonth) {
        const el = document.createElement('div');
        el.className = 'calendar-day';
        el.textContent = day;
        
        if (isOtherMonth) {
            el.classList.add('other-month');
        } else {
            const dateStr = this.formatDate(day);
            
            const today = new Date();
            if (this.isSameDate(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day), today)) {
                el.classList.add('today');
            }
            
            if (this.isSameDate(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day), this.selectedDate)) {
                el.classList.add('selected');
            }
            
            if (this.markedDates.includes(day)) {
                el.classList.add('has-workout'); 
            }

            el.addEventListener('click', () => {
                this.selectedDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
                this.render(); 
                this.onDateSelect(this.selectedDate);
            });
        }
        
        this.container.appendChild(el);
    }

    /**
     * @param {number} offset
     */
    changeMonth(offset) {
        this.currentDate.setMonth(this.currentDate.getMonth() + offset);
        this.render();
        this.onMonthChange(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
    }

    /**
     * @param {Array<number>} dates 
     */
    setMarkedDates(dates) {
        this.markedDates = dates || [];
        this.render();
    }

    getSelectedDate() {
        return this.selectedDate;
    }

    isSameDate(d1, d2) {
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    }
    
    formatDate(day) {
        const y = this.currentDate.getFullYear();
        const m = String(this.currentDate.getMonth() + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
}