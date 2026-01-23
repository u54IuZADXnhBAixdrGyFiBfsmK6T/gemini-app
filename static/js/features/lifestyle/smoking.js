export function initSmokingCalculator() {
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