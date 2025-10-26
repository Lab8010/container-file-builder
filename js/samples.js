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
        ]
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
        ]
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
        ]
    }
};

// レベルに応じた絵文字
const levelEmojis = {
    beginner: '⭐',
    intermediate: '⭐⭐',
    advanced: '⭐⭐⭐'
};

// サンプルをキャンバスに読み込む
function loadSample(sampleKey) {
    const sample = samples[sampleKey];
    if (!sample) {
        console.error('Sample not found:', sampleKey);
        return;
    }
    
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

