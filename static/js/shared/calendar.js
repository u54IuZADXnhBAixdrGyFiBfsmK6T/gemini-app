/**
 * 共通カレンダーコンポーネント
 * 依存: shared/calendar.css (必要に応じて作成)
 */
export class Calendar {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.monthLabel = document.getElementById(options.monthLabelId || 'calendarMonth');
        this.yearLabel = document.getElementById(options.yearLabelId || 'calendarYear');
        
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.markedDates = []; // データがある日付（ハイライト用）
        
        // コールバック関数
        this.onDateSelect = options.onDateSelect || (() => {});
        this.onMonthChange = options.onMonthChange || (() => {});
        
        this.init();
    }

    init() {
        this.render();
    }

    /**
     * カレンダーを描画する
     */
    render() {
        if (!this.container) return;
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // ヘッダー更新
        if (this.monthLabel) this.monthLabel.textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long' });
        if (this.yearLabel) this.yearLabel.textContent = year;
        
        this.container.innerHTML = '';
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const prevLastDay = new Date(year, month, 0);
        
        const firstDayOfWeek = firstDay.getDay(); // 0: Sun, 1: Mon...
        const lastDate = lastDay.getDate();
        const prevLastDate = prevLastDay.getDate();
        
        // 前月分の埋め草
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            this.createDayElement(prevLastDate - i, true);
        }
        
        // 当月分
        for (let day = 1; day <= lastDate; day++) {
            this.createDayElement(day, false);
        }
        
        // 次月分の埋め草（6週間分確保するため42マス埋める）
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
            
            // 今日かどうか
            const today = new Date();
            if (this.isSameDate(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day), today)) {
                el.classList.add('today');
            }
            
            // 選択中かどうか
            if (this.isSameDate(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day), this.selectedDate)) {
                el.classList.add('selected');
            }
            
            // データがあるか（ハイライト）
            if (this.markedDates.includes(day)) {
                el.classList.add('has-workout'); // CSSクラス名は適宜調整（has-data等）
            }
            
            // クリックイベント
            el.addEventListener('click', () => {
                this.selectedDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
                this.render(); // 再描画して選択状態を更新
                this.onDateSelect(this.selectedDate);
            });
        }
        
        this.container.appendChild(el);
    }

    /**
     * 月を移動する
     * @param {number} offset -1 (前月) or 1 (次月)
     */
    changeMonth(offset) {
        this.currentDate.setMonth(this.currentDate.getMonth() + offset);
        this.render();
        this.onMonthChange(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
    }

    /**
     * ハイライトする日付を設定して再描画
     * @param {Array<number>} dates 日付の数値配列 [1, 5, 12...]
     */
    setMarkedDates(dates) {
        this.markedDates = dates || [];
        this.render();
    }

    /**
     * 現在選択中の日付を取得
     */
    getSelectedDate() {
        return this.selectedDate;
    }

    // 内部ヘルパー
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