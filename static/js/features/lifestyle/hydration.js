export function initHydrationCalculator() {
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