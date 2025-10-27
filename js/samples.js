// サンプルContainerfileの定義
const samples = {
    webserver: {
        name_ja: '静的Webサーバー',
        name_en: 'Static Web Server',
        description_ja: 'Apache (httpd)を使った基本的なWebサーバー。HTMLファイルを配信します。',
        description_en: 'Basic web server using Apache (httpd) to serve HTML files.',
        level: 'beginner',
        blocks: [
            {
                type: 'FROM',
                value: 'fedora:39'
            },
            {
                type: 'RUN',
                value: 'dnf install -y httpd && dnf clean all'
            },
            {
                type: 'COPY',
                source: 'index.html',
                dest: '/var/www/html/'
            },
            {
                type: 'EXPOSE',
                value: '80'
            },
            {
                type: 'CMD',
                value: '/usr/sbin/httpd -D FOREGROUND'
            }
        ],
        additionalFiles: {
            'index.html': `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Container File Builder - Demo</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        h1 { font-size: 2.5em; margin-bottom: 20px; }
        p { font-size: 1.2em; line-height: 1.6; }
        .logo { font-size: 4em; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🎩</div>
        <h1>Container File Builder</h1>
        <p>このページはContainer File Builderで作成されたコンテナから配信されています！</p>
        <p>This page is served from a container created with Container File Builder!</p>
        <hr style="margin: 30px 0; border: 1px solid rgba(255,255,255,0.3);">
        <p><strong>サンプル:</strong> 静的Webサーバー (Apache httpd on Fedora)</p>
        <p><strong>Sample:</strong> Static Web Server (Apache httpd on Fedora)</p>
    </div>
</body>
</html>`
        }
    },
    
    breakout: {
        name_ja: 'ブロック崩しゲーム',
        name_en: 'Breakout Game',
        description_ja: 'HTML5 Canvasで作られたブロック崩しゲーム。nginxで配信します。',
        description_en: 'Breakout game built with HTML5 Canvas, served by nginx.',
        level: 'intermediate',
        blocks: [
            {
                type: 'FROM',
                value: 'fedora:39'
            },
            {
                type: 'RUN',
                value: 'dnf install -y nginx && dnf clean all'
            },
            {
                type: 'WORKDIR',
                value: '/usr/share/nginx/html'
            },
            {
                type: 'COPY',
                source: 'game.html',
                dest: 'index.html'
            },
            {
                type: 'EXPOSE',
                value: '80'
            },
            {
                type: 'CMD',
                value: 'nginx -g "daemon off;"'
            }
        ],
        additionalFiles: {
            'game.html': `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎮 ブロック崩しゲーム - Container File Builder</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
        }
        h1 {
            color: white;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        canvas {
            background: #1a1a1a;
            border: 4px solid white;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .info {
            margin-top: 20px;
            padding: 20px;
            background: rgba(255,255,255,0.9);
            border-radius: 10px;
            text-align: center;
        }
        .score {
            font-size: 24px;
            font-weight: bold;
            color: #764ba2;
        }
    </style>
</head>
<body>
    <h1>🎮 ブロック崩しゲーム</h1>
    <canvas id="gameCanvas" width="480" height="400"></canvas>
    <div class="info">
        <div class="score">スコア: <span id="score">0</span></div>
        <p>← → キーでパドルを操作 | Container File Builder で作成</p>
    </div>
    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        let score = 0;
        
        // ボール
        let x = canvas.width / 2;
        let y = canvas.height - 30;
        let dx = 2;
        let dy = -2;
        const ballRadius = 10;
        
        // パドル
        const paddleHeight = 10;
        const paddleWidth = 75;
        let paddleX = (canvas.width - paddleWidth) / 2;
        let rightPressed = false;
        let leftPressed = false;
        
        // ブロック
        const brickRowCount = 3;
        const brickColumnCount = 5;
        const brickWidth = 75;
        const brickHeight = 20;
        const brickPadding = 10;
        const brickOffsetTop = 30;
        const brickOffsetLeft = 30;
        
        const bricks = [];
        for (let c = 0; c < brickColumnCount; c++) {
            bricks[c] = [];
            for (let r = 0; r < brickRowCount; r++) {
                bricks[c][r] = { x: 0, y: 0, status: 1 };
            }
        }
        
        document.addEventListener('keydown', keyDownHandler);
        document.addEventListener('keyup', keyUpHandler);
        
        function keyDownHandler(e) {
            if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = true;
            else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = true;
        }
        
        function keyUpHandler(e) {
            if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = false;
            else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = false;
        }
        
        function collisionDetection() {
            for (let c = 0; c < brickColumnCount; c++) {
                for (let r = 0; r < brickRowCount; r++) {
                    const b = bricks[c][r];
                    if (b.status === 1) {
                        if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                            dy = -dy;
                            b.status = 0;
                            score++;
                            document.getElementById('score').textContent = score;
                            if (score === brickRowCount * brickColumnCount) {
                                alert('🎉 おめでとうございます！全てのブロックを破壊しました！');
                                document.location.reload();
                            }
                        }
                    }
                }
            }
        }
        
        function drawBall() {
            ctx.beginPath();
            ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#CC0000';
            ctx.fill();
            ctx.closePath();
        }
        
        function drawPaddle() {
            ctx.beginPath();
            ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
            ctx.fillStyle = '#764ba2';
            ctx.fill();
            ctx.closePath();
        }
        
        function drawBricks() {
            for (let c = 0; c < brickColumnCount; c++) {
                for (let r = 0; r < brickRowCount; r++) {
                    if (bricks[c][r].status === 1) {
                        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                        bricks[c][r].x = brickX;
                        bricks[c][r].y = brickY;
                        ctx.beginPath();
                        ctx.rect(brickX, brickY, brickWidth, brickHeight);
                        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1'];
                        ctx.fillStyle = colors[r];
                        ctx.fill();
                        ctx.closePath();
                    }
                }
            }
        }
        
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBricks();
            drawBall();
            drawPaddle();
            collisionDetection();
            
            if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
                dx = -dx;
            }
            if (y + dy < ballRadius) {
                dy = -dy;
            } else if (y + dy > canvas.height - ballRadius) {
                if (x > paddleX && x < paddleX + paddleWidth) {
                    dy = -dy;
                } else {
                    alert('ゲームオーバー！スコア: ' + score);
                    document.location.reload();
                }
            }
            
            if (rightPressed && paddleX < canvas.width - paddleWidth) {
                paddleX += 7;
            } else if (leftPressed && paddleX > 0) {
                paddleX -= 7;
            }
            
            x += dx;
            y += dy;
            requestAnimationFrame(draw);
        }
        
        draw();
    </script>
</body>
</html>`
        }
    },
    
    multistage: {
        name_ja: 'マルチステージビルド',
        name_en: 'Multi-stage Build',
        description_ja: 'Goアプリをビルドして実行する最適化されたコンテナ構成。2段階ビルドでサイズを削減します。',
        description_en: 'Optimized container for building and running a Go application with multi-stage build.',
        level: 'advanced',
        blocks: [
            {
                type: 'FROM',
                value: 'fedora:39',
                asName: 'builder'
            },
            {
                type: 'RUN',
                value: 'dnf install -y golang git && dnf clean all'
            },
            {
                type: 'WORKDIR',
                value: '/app'
            },
            {
                type: 'COPY',
                source: 'main.go',
                dest: '.'
            },
            {
                type: 'RUN',
                value: 'go build -o myapp main.go'
            },
            {
                type: 'FROM',
                value: 'fedora:39'
            },
            {
                type: 'WORKDIR',
                value: '/app'
            },
            {
                type: 'COPY',
                source: '--from=builder /app/myapp',
                dest: '.'
            },
            {
                type: 'EXPOSE',
                value: '8080'
            },
            {
                type: 'CMD',
                value: './myapp'
            }
        ],
        additionalFiles: {
            'main.go': `package main

import (
    "fmt"
    "log"
    "net/http"
    "time"
)

func main() {
    http.HandleFunc("/", handleHome)
    http.HandleFunc("/health", handleHealth)
    
    port := ":8080"
    fmt.Printf("🎩 Container File Builder - Go App\\n")
    fmt.Printf("Server starting on port %s\\n", port)
    
    log.Fatal(http.ListenAndServe(port, nil))
}

func handleHome(w http.ResponseWriter, r *http.Request) {
    html := \`<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Go Web App - Container File Builder</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%);
            color: white;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        h1 { font-size: 2.5em; margin-bottom: 20px; }
        .info {
            background: rgba(255, 255, 255, 0.2);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        code {
            background: rgba(0, 0, 0, 0.3);
            padding: 2px 8px;
            border-radius: 4px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Go Web Application</h1>
        <p>このページはGoで書かれたWebサーバーから配信されています！</p>
        <p>This page is served from a Go web server!</p>
        
        <div class="info">
            <h3>🎩 Container File Builder</h3>
            <p><strong>サンプル:</strong> マルチステージビルド</p>
            <p><strong>Sample:</strong> Multi-stage Build</p>
            <p><strong>言語:</strong> Go (Golang)</p>
            <p><strong>Language:</strong> Go (Golang)</p>
        </div>
        
        <div class="info">
            <h3>💡 マルチステージビルドの利点</h3>
            <ul>
                <li>✅ ビルドツールを本番イメージに含めない</li>
                <li>✅ 最終イメージサイズを大幅に削減</li>
                <li>✅ セキュリティリスクの軽減</li>
                <li>✅ デプロイが高速化</li>
            </ul>
        </div>
        
        <p style="margin-top: 30px; opacity: 0.8;">
            <strong>エンドポイント:</strong><br>
            <code>GET /</code> - このページ<br>
            <code>GET /health</code> - ヘルスチェック
        </p>
    </div>
</body>
</html>\`
    
    w.Header().Set("Content-Type", "text/html; charset=utf-8")
    fmt.Fprint(w, html)
    
    log.Printf("[%s] %s %s", time.Now().Format("2006-01-02 15:04:05"), r.Method, r.URL.Path)
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    fmt.Fprint(w, \`{"status":"healthy","app":"container-file-builder-go-app"}\`)
}`
        }
    }
};

// レベルに応じた絵文字
const levelEmojis = {
    beginner: '⭐',
    intermediate: '⭐⭐',
    advanced: '⭐⭐⭐'
};

// 現在ロードされているサンプルキー
let currentSampleKey = null;

// サンプルをキャンバスに読み込む
function loadSample(sampleKey) {
    const sample = samples[sampleKey];
    if (!sample) {
        console.error('Sample not found:', sampleKey);
        return;
    }
    
    currentSampleKey = sampleKey;
    
    // キャンバスにブロックがある場合は確認
    if (Object.keys(canvasBlocksData).length > 0) {
        const confirmMsg = getCurrentLanguage() === 'ja'
            ? 'キャンバスをクリアしてサンプルを読み込みますか？'
            : 'Clear the canvas and load the sample?';
        if (!confirm(confirmMsg)) {
            return;
        }
    }
    
    // キャンバスをクリア
    canvasBlocksData = {};
    const canvas = document.getElementById('canvas');
    canvas.innerHTML = '';
    
    // サンプルのブロックを追加
    sample.blocks.forEach((blockData, index) => {
        const blockId = `block-${Date.now()}-${index}`;
        const blockDef = blockDefinitions[blockData.type];
        
        if (!blockDef) {
            console.error('Block definition not found:', blockData.type);
            return;
        }
        
        // ブロックの値をfieldsに基づいて構築
        const values = {};
        
        // 各ブロックタイプに応じてvaluesを構築
        if (blockData.type === 'FROM') {
            values.image = blockData.value || '';
            if (blockData.asName) {
                values.asName = blockData.asName;
            }
        } else if (blockData.type === 'COPY' || blockData.type === 'ADD') {
            values.source = blockData.source || '';
            values.dest = blockData.dest || '';
        } else {
            // その他のブロック（RUN, CMD, WORKDIR など）
            const mainField = blockDef.fields[0];
            if (mainField) {
                values[mainField.name] = blockData.value || '';
            }
        }
        
        // addBlockToCanvas関数を使用してブロックを追加
        addBlockToCanvas(blockId, blockData.type, values);
    });
    
    // プレビューを更新
    updatePreview();
    
    // FROMプロンプトを更新
    if (typeof updateFromPrompt === 'function') {
        updateFromPrompt();
    }
    
    // 成功メッセージ
    const successMsg = getCurrentLanguage() === 'ja'
        ? `サンプル「${sample.name_ja}」を読み込みました！`
        : `Loaded sample: ${sample.name_en}`;
    
    showNotification(successMsg, 'success');
    
    // 追加ファイルを表示
    displayAdditionalFiles(sample);
}

// 追加ファイルを表示
function displayAdditionalFiles(sample) {
    const additionalFilesPanel = document.getElementById('additionalFilesPanel');
    if (!additionalFilesPanel) return;
    
    const lang = getCurrentLanguage();
    
    if (!sample.additionalFiles || Object.keys(sample.additionalFiles).length === 0) {
        additionalFilesPanel.style.display = 'none';
        return;
    }
    
    let html = `
        <div class="additional-files-header">
            <h3>${lang === 'ja' ? '📄 必要なファイル' : '📄 Required Files'}</h3>
            <p class="additional-files-note">${lang === 'ja' 
                ? 'このサンプルをビルドするには、以下のファイルが必要です。各ファイルをダウンロードしてContainerfileと同じディレクトリに配置してください。' 
                : 'To build this sample, you need the following files. Download each file and place them in the same directory as the Containerfile.'}</p>
        </div>
        <div class="additional-files-list">
    `;
    
    for (const [filename, content] of Object.entries(sample.additionalFiles)) {
        const fileExtension = filename.split('.').pop();
        let icon = '📄';
        if (fileExtension === 'html') icon = '🌐';
        else if (fileExtension === 'go') icon = '🔷';
        else if (fileExtension === 'py') icon = '🐍';
        else if (fileExtension === 'js') icon = '💛';
        
        html += `
            <div class="additional-file-item">
                <div class="file-item-header">
                    <span class="file-icon">${icon}</span>
                    <span class="file-name">${filename}</span>
                    <button class="btn btn-mini" onclick="downloadAdditionalFile('${filename}', '${currentSampleKey}')">
                        💾 ${lang === 'ja' ? 'ダウンロード' : 'Download'}
                    </button>
                </div>
                <div class="file-preview-toggle" onclick="toggleFilePreview('${filename}')">
                    👁️ ${lang === 'ja' ? 'プレビュー表示' : 'Show Preview'}
                </div>
                <div class="file-content-preview" id="preview-${filename}" style="display: none;">
                    <pre><code>${escapeHtmlForSample(content)}</code></pre>
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    additionalFilesPanel.innerHTML = html;
    additionalFilesPanel.style.display = 'block';
}

// HTMLエスケープ（サンプル用）
function escapeHtmlForSample(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ファイルプレビューをトグル
function toggleFilePreview(filename) {
    const preview = document.getElementById(`preview-${filename}`);
    if (preview) {
        if (preview.style.display === 'none') {
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
    }
}

// 追加ファイルをダウンロード
function downloadAdditionalFile(filename, sampleKey) {
    const sample = samples[sampleKey];
    if (!sample || !sample.additionalFiles || !sample.additionalFiles[filename]) {
        alert('File not found');
        return;
    }
    
    const content = sample.additionalFiles[filename];
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    const lang = getCurrentLanguage();
    showNotification(lang === 'ja' ? `${filename} をダウンロードしました！` : `Downloaded ${filename}!`, 'success');
}

// 通知を表示
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

