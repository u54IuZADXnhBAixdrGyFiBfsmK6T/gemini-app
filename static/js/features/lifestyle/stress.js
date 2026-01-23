export function initStressCalculator() {
    const calculateBtn = document.getElementById('calculateStress');
    if (!calculateBtn) return;
    
    calculateBtn.addEventListener('click', function() {
        const sleep = parseInt(document.getElementById('sleepHours').value) || 0;
        const exercise = parseInt(document.getElementById('exerciseFreq').value) || 0;
        const work = parseInt(document.getElementById('workHours').value) || 0;
        const relaxation = parseInt(document.getElementById('relaxationTime').value) || 0;
        
        let stressScore = 0;
        
        if (sleep < 6) stressScore += 3;
        else if (sleep < 7) stressScore += 2;
        else if (sleep <= 9) stressScore += 0;
        else stressScore += 1;
        
        // Exercise factor
        if (exercise === 0) stressScore += 3;
        else if (exercise <= 2) stressScore += 1;
        else stressScore += 0;
        
        // Work hours factor
        if (work > 10) stressScore += 3;
        else if (work > 8) stressScore += 2;
        else if (work >= 6) stressScore += 1;
        
        // Relaxation time factor
        if (relaxation === 0) stressScore += 2;
        else if (relaxation < 30) stressScore += 1;
        
        // Determine stress level
        let level, color, advice;
        if (stressScore <= 3) {
            level = '低';
            color = '#4caf50';
            advice = '素晴らしいです！現在のライフスタイルを維持しましょう。';
        } else if (stressScore <= 6) {
            level = '中';
            color = '#ff9800';
            advice = 'やや注意が必要です。睡眠時間の確保とリラックス時間を増やすことをお勧めします。';
        } else {
            level = '高';
            color = '#f44336';
            advice = '要注意！ストレス管理が必要です。専門家への相談も検討してください。';
        }
        
        const resultDiv = document.getElementById('stressResult');
        resultDiv.innerHTML = `
            <h4 style="color: ${color};">ストレスレベル: ${level}</h4>
            <p><strong>スコア:</strong> ${stressScore}/12</p>
            <p>${advice}</p>
            <div style="margin-top: 15px; padding: 15px; background: #f0f0f0; border-radius: 8px;">
                <strong>改善のヒント:</strong>
                <ul style="margin-top: 10px; margin-left: 20px;">
                    ${sleep < 7 ? '<li>睡眠時間を7-9時間確保しましょう</li>' : ''}
                    ${exercise < 3 ? '<li>週3回以上の運動を心がけましょう</li>' : ''}
                    ${work > 8 ? '<li>労働時間の見直しを検討しましょう</li>' : ''}
                    ${relaxation < 30 ? '<li>毎日30分以上のリラックス時間を作りましょう</li>' : ''}
                </ul>
            </div>
        `;
        resultDiv.classList.add('show');
    });
}