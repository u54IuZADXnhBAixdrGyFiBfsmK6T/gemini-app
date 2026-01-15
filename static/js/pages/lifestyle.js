document.addEventListener('DOMContentLoaded', function() {
    initSmoothScrolling();
    initStressCalculator();
    initSleepCalculator();
    initAlcoholCalculator();
    initSmokingCalculator();
    initHydrationCalculator();
});

function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function initStressCalculator() {
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

// Sleep Calculator
function initSleepCalculator() {
    const calculateBtn = document.getElementById('calculateSleep');
    if (!calculateBtn) return;
    
    calculateBtn.addEventListener('click', function() {
        const wakeTime = document.getElementById('wakeTime').value;
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

// ========================================
// Alcohol Calculator
// ========================================
function initAlcoholCalculator() {
    const calculateBtn = document.getElementById('calculateAlcohol');
    if (!calculateBtn) return;
    
    calculateBtn.addEventListener('click', function() {
        const drinkType = document.getElementById('drinkType').value;
        const amount = parseFloat(document.getElementById('drinkAmount').value) || 0;
        const weight = parseFloat(document.getElementById('bodyWeight').value) || 70;
        
        // Alcohol content and calories per 100ml
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
        
        // Metabolism time (約1時間で4-6g分解)
        const metabolismTime = Math.ceil(pureAlcohol / 5);
        
        // Blood alcohol concentration (Widmark formula simplified)
        const bac = (pureAlcohol / (weight * 0.6)) * 100;
        
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
                    <div class="stat-number">${bac.toFixed(2)}%</div>
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

// Smoking Impact Calculator
function initSmokingCalculator() {
    const calculateBtn = document.getElementById('calculateSmoking');
    if (!calculateBtn) return;
    
    calculateBtn.addEventListener('click', function() {
        const cigarettesPerDay = parseInt(document.getElementById('cigarettesPerDay').value) || 0;
        const yearsSmoked = parseInt(document.getElementById('yearsSmoked').value) || 0;
        const quitDays = parseInt(document.getElementById('quitDays').value) || 0;
        
        // Calculate total cigarettes and costs
        const totalCigarettes = cigarettesPerDay * 365 * yearsSmoked;
        const costPerPack = 600; // JPY
        const cigarettesPerPack = 20;
        const totalCost = Math.floor((totalCigarettes / cigarettesPerPack) * costPerPack);
        
        // Health recovery timeline
        const recoveryMilestones = [
            { days: 1, text: '心拍数と血圧が正常化' },
            { days: 2, text: '味覚と嗅覚が改善' },
            { days: 3, text: 'ニコチンが体内から排出' },
            { days: 7, text: '肺機能が5-10%改善' },
            { days: 30, text: '持久力が向上' },
            { days: 90, text: '血液循環が大幅改善' },
            { days: 180, text: '呼吸機能が20-30%向上' },
            { days: 365, text: '心臓病リスクが50%低下' }
        ];
        
        const nextMilestone = recoveryMilestones.find(m => m.days > quitDays) || recoveryMilestones[recoveryMilestones.length - 1];
        const passedMilestones = recoveryMilestones.filter(m => m.days <= quitDays);
        
        const resultDiv = document.getElementById('smokingResult');
        
        if (quitDays > 0) {
            resultDiv.innerHTML = `
                <h4>🎉 禁煙 ${quitDays} 日目！</h4>
                <div class="stats-grid" style="margin-top: 20px;">
                    <div class="stat-card">
                        <div class="stat-number">${quitDays}</div>
                        <div class="stat-label">禁煙日数</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${cigarettesPerDay * quitDays}</div>
                        <div class="stat-label">吸わなかった本数</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">¥${Math.floor((cigarettesPerDay * quitDays / cigarettesPerPack) * costPerPack).toLocaleString()}</div>
                        <div class="stat-label">節約金額</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${Math.floor(cigarettesPerDay * quitDays * 11 / 60)}</div>
                        <div class="stat-label">取り戻した時間(時間)</div>
                    </div>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: #e8f5e9; border-radius: 8px;">
                    <strong>✅ 達成したマイルストーン:</strong>
                    <ul style="margin-top: 10px; margin-left: 20px;">
                        ${passedMilestones.map(m => `<li>${m.text} (${m.days}日)</li>`).join('')}
                    </ul>
                </div>
                
                <div style="margin-top: 15px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
                    <strong>🎯 次のマイルストーン:</strong>
                    <p style="margin-top: 5px;">${nextMilestone.text} (あと ${nextMilestone.days - quitDays} 日)</p>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <h4>喫煙の影響分析</h4>
                <div class="stats-grid" style="margin-top: 20px;">
                    <div class="stat-card">
                        <div class="stat-number">${totalCigarettes.toLocaleString()}</div>
                        <div class="stat-label">総喫煙本数</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">¥${totalCost.toLocaleString()}</div>
                        <div class="stat-label">総費用</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${Math.floor(totalCigarettes * 11 / 60)}</div>
                        <div class="stat-label">失われた時間(時間)</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">-15~20%</div>
                        <div class="stat-label">筋力低下</div>
                    </div>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: #ffebee; border-radius: 8px;">
                    <strong>⚠️ フィットネスへの悪影響:</strong>
                    <ul style="margin-top: 10px; margin-left: 20px; color: #666;">
                        <li><strong>酸素供給量:</strong> 一酸化炭素が酸素輸送を阻害</li>
                        <li><strong>持久力:</strong> 肺機能が20-30%低下</li>
                        <li><strong>筋肉回復:</strong> 血流悪化により回復が遅延</li>
                        <li><strong>筋肥大:</strong> タンパク質合成が阻害される</li>
                        <li><strong>代謝:</strong> 基礎代謝が低下</li>
                    </ul>
                </div>
                
                <div style="margin-top: 15px; padding: 15px; background: #e8f5e9; border-radius: 8px;">
                    <strong>💪 禁煙のメリット:</strong>
                    <p style="margin-top: 10px;">今すぐ禁煙すれば、わずか数週間で運動能力の向上を実感できます！</p>
                </div>
            `;
        }
        
        resultDiv.classList.add('show');
    });
}

// Hydration Calculator
function initHydrationCalculator() {
    const calculateBtn = document.getElementById('calculateHydration');
    if (!calculateBtn) return;
    
    calculateBtn.addEventListener('click', function() {
        const weight = parseFloat(document.getElementById('hydrationWeight').value) || 70;
        const exerciseIntensity = document.getElementById('exerciseIntensity').value;
        const climate = document.getElementById('climate').value;
        
        // Base water need: 30-35ml per kg
        let baseWater = weight * 33;
        
        // Exercise adjustment
        const exerciseAdjustment = {
            none: 0,
            light: 500,
            moderate: 1000,
            intense: 1500
        };
        baseWater += exerciseAdjustment[exerciseIntensity];
        
        // Climate adjustment
        const climateAdjustment = {
            cold: -200,
            normal: 0,
            hot: 500
        };
        baseWater += climateAdjustment[climate];
        
        // Calculate for different times
        const perHour = Math.round(baseWater / 16);
        const perMeal = Math.round(baseWater / 3);
        const preWorkout = 500;
        const duringWorkout = exerciseIntensity === 'intense' ? 1000 : 500;
        const postWorkout = 500;
        
        const resultDiv = document.getElementById('hydrationResult');
        resultDiv.innerHTML = `
            <h4>1日の推奨水分摂取量</h4>
            <div style="text-align: center; margin: 20px 0;">
                <div style="font-size: 3rem; font-weight: 700; color: #2196f3;">
                    ${(baseWater / 1000).toFixed(1)}L
                </div>
                <div style="color: #666; margin-top: 5px;">約 ${Math.round(baseWater / 200)} コップ (200ml)</div>
            </div>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin-top: 20px;">
                <strong>タイミング別の目安:</strong>
                <ul style="margin-top: 15px; list-style: none; padding: 0;">
                    <li style="padding: 10px; border-bottom: 1px solid #ddd;">
                        <strong>起床時:</strong> 200-300ml (睡眠中の脱水を補給)
                    </li>
                    <li style="padding: 10px; border-bottom: 1px solid #ddd;">
                        <strong>食事時:</strong> ${perMeal}ml × 3回
                    </li>
                    <li style="padding: 10px; border-bottom: 1px solid #ddd;">
                        <strong>トレーニング前:</strong> ${preWorkout}ml (30分前)
                    </li>
                    <li style="padding: 10px; border-bottom: 1px solid #ddd;">
                        <strong>トレーニング中:</strong> ${duringWorkout}ml (15-20分ごとに一口)
                    </li>
                    <li style="padding: 10px; border-bottom: 1px solid #ddd;">
                        <strong>トレーニング後:</strong> ${postWorkout}ml (失われた水分の補給)
                    </li>
                    <li style="padding: 10px;">
                        <strong>1時間ごと:</strong> ${perHour}ml (こまめな補給)
                    </li>
                </ul>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
                <strong>💧 水分補給のポイント:</strong>
                <ul style="margin-top: 10px; margin-left: 20px; color: #666;">
                    <li>のどが渇く前にこまめに飲む</li>
                    <li>尿の色が薄い黄色なら適切</li>
                    <li>カフェイン飲料は利尿作用があるため別途水分補給</li>
                    <li>電解質(ナトリウム、カリウム)も重要</li>
                    <li>高強度トレーニング後はスポーツドリンクも検討</li>
                </ul>
            </div>
            
            <div style="margin-top: 15px; padding: 15px; background: #fff3e0; border-radius: 8px;">
                <strong>⚠️ 脱水の兆候:</strong>
                <ul style="margin-top: 5px; margin-left: 20px; color: #666;">
                    <li>濃い色の尿</li>
                    <li>のどの渇き</li>
                    <li>疲労感</li>
                    <li>頭痛</li>
                    <li>パフォーマンスの低下</li>
                </ul>
            </div>
        `;
        resultDiv.classList.add('show');
    });
}