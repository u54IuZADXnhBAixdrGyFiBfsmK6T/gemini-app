import { initSmoothScrolling } from '../shared/utils.js';

import { initStressCalculator } from '../features/lifestyle/stress.js';
import { initSleepCalculator } from '../features/lifestyle/sleep.js';
import { initAlcoholCalculator } from '../features/lifestyle/drinking.js';
import { initSmokingCalculator } from '../features/lifestyle/smoking.js';
import { initHydrationCalculator } from '../features/lifestyle/hydration.js';
import { initRecoveryCalculator } from '../features/lifestyle/recovery.js';

document.addEventListener('DOMContentLoaded', function() {
    initSmoothScrolling(80);
    
    // 初期化
    initStressCalculator();
    initSleepCalculator();
    initAlcoholCalculator();
    initSmokingCalculator();
    initHydrationCalculator();
    initRecoveryCalculator();
});