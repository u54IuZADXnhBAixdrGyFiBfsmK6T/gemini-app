export function initRecoveryCalculator() {
    const calculateBtn = document.getElementById('calculateRecovery');
    if (!calculateBtn) return;

    calculateBtn.addEventListener('click', function() {
        const sleepQuality = parseInt(document.getElementById('sleepQuality').value) || 0;
        const muscleSoreness = parseInt(document.getElementById('muscleSoreness').value) || 0;
        const fatigueLevel = parseInt(document.getElementById('fatigueLevel').value) || 0;
        const moodState = parseInt(document.getElementById('moodState').value) || 0;
        const motivation = parseInt(document.getElementById('motivation').value) || 0;
        const restingHR = parseInt(document.getElementById('restingHR').value) || 0;

        const totalScore = sleepQuality + muscleSoreness + fatigueLevel + moodState + motivation + restingHR;

        let level, color, advice, trainingRec;

        if (totalScore >= 25) {
            level = '優れた回復';
            color = '#4caf50';
            advice = '体は完全に回復しています。最高のパフォーマンスが期待できます。';
            trainingRec = '高強度トレーニングOK';
        } else if (totalScore >= 19) {
            level = '良好な回復';
            color = '#8bc34a';
            advice = '良い状態です。計画通りのトレーニングが可能です。';
            trainingRec = '通常トレーニング';
        } else if (totalScore >= 13) {
            level = 'やや不良';
            color = '#ffc107';
            advice = '疲労が蓄積している可能性があります。トレーニングの強度を少し下げるか、アクティブレストを検討しましょう。';
            trainingRec = '軽めのトレーニング or アクティブレスト';
        } else {
            level = '回復不足';
            color = '#f44336';
            advice = '回復が不十分です。オーバートレーニングのリスクがあります。今日は完全休養を取り、睡眠と栄養に集中してください。';
            trainingRec = '完全休養を推奨';
        }

        const resultDiv = document.getElementById('recoveryResult');
        resultDiv.innerHTML = `
            <h4 style="color: ${color};">回復レベル: ${level}</h4>
            <p><strong>総合スコア:</strong> ${totalScore} / 30</p>
            <p style="margin-top: 15px;"><strong>アドバイス:</strong><br>${advice}</p>
            <div style="margin-top: 20px; padding: 15px; background: #fff; border-radius: 8px; text-align: center;">
                <p style="margin: 0; font-weight: bold; font-size: 1.1rem;">本日の推奨トレーニング:</p>
                <p style="margin: 5px 0 0 0; font-size: 1.2rem; color: ${color}; font-weight: bold;">${trainingRec}</p>
            </div>
        `;
        resultDiv.classList.add('show');
    });
}