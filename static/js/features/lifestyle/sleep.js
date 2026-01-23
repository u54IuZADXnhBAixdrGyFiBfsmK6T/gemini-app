export function initSleepCalculator() {
    const calculateBtn = document.getElementById('calculateSleep');
    const wakeTimeInput = document.getElementById('wakeTime'); 

    if (!calculateBtn || !wakeTimeInput) return;

    wakeTimeInput.value = '07:00';
    
    calculateBtn.addEventListener('click', function() {
        const wakeTime = wakeTimeInput.value;
        if (!wakeTime) {
            alert('起床時刻を入力してください');
            return;
        }
        
        const [hours, minutes] = wakeTime.split(':').map(Number);
        const wakeDate = new Date();
        wakeDate.setHours(hours, minutes, 0);
        
        // Calculate optimal sleep times (90-minute cycles)
        const cycles = [6, 5, 4]; // 9h, 7.5h, 6h
        const results = cycles.map(cycle => {
            const sleepTime = new Date(wakeDate.getTime() - (cycle * 90 * 60 * 1000) - (15 * 60 * 1000)); // 15min to fall asleep
            return {
                cycle: cycle,
                hours: cycle * 1.5,
                time: sleepTime.toLocaleTimeString('ja-JP', {hour: '2-digit', minute: '2-digit'})
            };
        });
        
        const resultDiv = document.getElementById('sleepResult');
        resultDiv.innerHTML = `
            <h4>推奨就寝時刻</h4>
            <p style="margin-bottom: 15px;">睡眠サイクル(90分)を考慮した最適な就寝時刻です:</p>
            ${results.map((r, i) => `
                <div style="padding: 15px; margin-bottom: 10px; background: ${i === 0 ? '#e3f2fd' : '#f5f5f5'}; border-radius: 8px; border-left: 4px solid ${i === 0 ? '#2196f3' : '#999'};">
                    <strong>${r.time}</strong> (${r.hours}時間 / ${r.cycle}サイクル)
                    ${i === 0 ? '<span style="color: #2196f3; margin-left: 10px;">推奨</span>' : ''}
                </div>
            `).join('')}
            <p style="margin-top: 15px; color: #666; font-size: 0.95rem;">
                ※入眠に15分かかることを想定しています<br>
                ※最も推奨されるのは7.5-9時間の睡眠です
            </p>
        `;
        resultDiv.classList.add('show');
    });
}