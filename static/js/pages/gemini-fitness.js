document.getElementById("recommendBtn").addEventListener("click", getRecommendation);

async function getRecommendation() {
    const height = document.getElementById('height').value;
    const weight = document.getElementById('weight').value;
    const activity = document.getElementById('activity').value;
    const ideal = document.getElementById('ideal').value;
    const outputDiv = document.getElementById('output');

    if (!height || !weight || !activity || !ideal) {
        outputDiv.innerHTML = "                  全ての項目を入力してください";
        return;
    }

    outputDiv.innerHTML = '<p class="loading">           Gemini AIが提案を作成しています</p>';

    try {
        const response = await fetch('/get_recommendation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ height, weight, activity, ideal })
        });

        const result = await response.json();

        if (response.ok) {
            outputDiv.innerHTML = marked.parse(result.recommendation);
        } else {
            outputDiv.innerHTML = `エラーが発生しました: ${result.error || '不明なエラー'}`;
        }

    } catch (error) {
        console.error('Fetch Error:', error);
        outputDiv.innerHTML = `通信エラーが発生しました: ${error.message}`;
    }
}
