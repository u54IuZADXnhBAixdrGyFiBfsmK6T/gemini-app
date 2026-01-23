export function initAlcoholCalculator() {
    const calculateBtn = document.getElementById('calculateAlcohol');
    if (!calculateBtn) return;
    
    calculateBtn.addEventListener('click', function() {
        const drinkType = document.getElementById('drinkType').value;
        const amount = parseFloat(document.getElementById('drinkAmount').value) || 0;
        const weight = parseFloat(document.getElementById('bodyWeight').value) || 70;
        
        const genderElement = document.getElementById('gender');
        const gender = genderElement ? genderElement.value : 'male';

        const drinks = {
            beer: { alcohol: 5, calories: 40, name: 'ビール' },
            wine: { alcohol: 12, calories: 73, name: 'ワイン' },
            sake: { alcohol: 15, calories: 103, name: '日本酒' },
            whisky: { alcohol: 40, calories: 237, name: 'ウイスキー' },
            shochu: { alcohol: 25, calories: 146, name: '焼酎' }
        };
        
        const drink = drinks[drinkType];
        const pureAlcohol = (amount * drink.alcohol / 100) * 0.8; // g
        const totalCalories = (amount / 100) * drink.calories;
        const metabolismTime = Math.ceil(pureAlcohol / 5);
        const widmarkFactor = gender === 'male' ? 0.7 : 0.6;
        const bac = (pureAlcohol / (weight * widmarkFactor)) / 10;
        const resultDiv = document.getElementById('alcoholResult');
        resultDiv.innerHTML = `
            <h4>${drink.name} ${amount}ml の影響</h4>
            <div class="stats-grid" style="margin-top: 20px;">
                <div class="stat-card">
                    <div class="stat-number">${pureAlcohol.toFixed(1)}g</div>
                    <div class="stat-label">純アルコール量</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${totalCalories.toFixed(0)}</div>
                    <div class="stat-label">カロリー</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${metabolismTime}</div>
                    <div class="stat-label">分解時間(時間)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${bac.toFixed(3)}%</div>
                    <div class="stat-label">血中アルコール濃度</div>
                </div>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: #fff3e0; border-radius: 8px;">
                <strong>⚠️ 筋肥大への影響:</strong>
                <ul style="margin-top: 10px; margin-left: 20px; color: #666;">
                    <li>タンパク質合成が約20-30%低下</li>
                    <li>テストステロンレベルが一時的に低下</li>
                    <li>回復プロセスが遅延</li>
                    <li>脱水症状により筋肉の成長を阻害</li>
                </ul>
                <p style="margin-top: 10px; color: #e65100;"><strong>推奨:</strong> トレーニング後48時間は飲酒を控えましょう</p>
            </div>
        `;
        resultDiv.classList.add('show');
    });
}