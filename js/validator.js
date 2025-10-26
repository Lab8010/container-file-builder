// Dockerfileバリデーション機能

// バリデーションルール定義
const validationRules = {
    // FROM命令は必須
    requireFrom: {
        check: (blocks) => {
            return blocks.some(block => block.type === 'FROM');
        },
        message: '❌ FROM命令が必要です。ベースイメージを指定してください。',
        severity: 'error',
        help: 'FROM命令はDockerfileの最初に配置し、ベースとなるイメージを指定します。'
    },
    
    // FROMは最初に配置されるべき
    fromShouldBeFirst: {
        check: (blocks) => {
            if (blocks.length === 0) return true;
            const firstBlock = blocks[0];
            // ARGはFROMより前に来ることができる
            if (firstBlock.type === 'ARG') {
                // ARGの後にFROMがあるかチェック
                return blocks.some(block => block.type === 'FROM');
            }
            return firstBlock.type === 'FROM';
        },
        message: '⚠️ FROM命令は最初（またはARGの直後）に配置することを推奨します。',
        severity: 'warning',
        help: 'FROM命令より前に配置できるのはARG命令のみです。'
    },
    
    // CMDとENTRYPOINTは1つまで（最後のものが有効）
    multipleCmdWarning: {
        check: (blocks) => {
            const cmdCount = blocks.filter(block => block.type === 'CMD').length;
            return cmdCount <= 1;
        },
        message: '⚠️ CMD命令が複数あります。最後のCMD命令のみが有効になります。',
        severity: 'warning',
        help: 'CMD命令は通常1つだけ配置します。'
    },
    
    multipleEntrypointWarning: {
        check: (blocks) => {
            const entrypointCount = blocks.filter(block => block.type === 'ENTRYPOINT').length;
            return entrypointCount <= 1;
        },
        message: '⚠️ ENTRYPOINT命令が複数あります。最後のENTRYPOINT命令のみが有効になります。',
        severity: 'warning',
        help: 'ENTRYPOINT命令は通常1つだけ配置します。'
    },
    
    // WORKDIRの前にCOPY/ADDがある場合の警告
    copyBeforeWorkdir: {
        check: (blocks) => {
            let workdirFound = false;
            for (let i = 0; i < blocks.length; i++) {
                if (blocks[i].type === 'WORKDIR') {
                    workdirFound = true;
                }
                if (!workdirFound && (blocks[i].type === 'COPY' || blocks[i].type === 'ADD')) {
                    return false;
                }
            }
            return true;
        },
        message: '⚠️ WORKDIRを設定する前にCOPY/ADDを使用しています。',
        severity: 'warning',
        help: 'WORKDIRを先に設定すると、ファイルの配置先が明確になります。'
    },
    
    // EXPOSEの値が有効なポート番号か
    validateExposePort: {
        check: (blocks) => {
            const exposeBlocks = blocks.filter(block => block.type === 'EXPOSE');
            for (let block of exposeBlocks) {
                const port = block.values.port;
                if (port) {
                    const portNum = parseInt(port);
                    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
                        return false;
                    }
                }
            }
            return true;
        },
        message: '❌ EXPOSEのポート番号が無効です。1〜65535の範囲で指定してください。',
        severity: 'error',
        help: 'ポート番号は1から65535の間である必要があります。'
    },
    
    // USERの前にユーザーを作成しているか（RUNでuseraddなど）
    userWithoutCreation: {
        check: (blocks) => {
            let userCreated = false;
            for (let i = 0; i < blocks.length; i++) {
                const block = blocks[i];
                if (block.type === 'RUN' && block.values.command) {
                    const cmd = block.values.command.toLowerCase();
                    if (cmd.includes('useradd') || cmd.includes('adduser') || cmd.includes('groupadd')) {
                        userCreated = true;
                    }
                }
                if (block.type === 'USER' && block.values.username !== 'root') {
                    if (!userCreated && i > 0) {
                        return false;
                    }
                }
            }
            return true;
        },
        message: '⚠️ USERを使用していますが、ユーザー作成コマンド（useradd等）が見つかりません。',
        severity: 'warning',
        help: 'ベースイメージに存在しないユーザーを指定する場合は、RUNでuseraddコマンドを実行してユーザーを作成してください。'
    },
    
    // 空のRUNコマンド
    emptyRunCommand: {
        check: (blocks) => {
            const runBlocks = blocks.filter(block => block.type === 'RUN');
            for (let block of runBlocks) {
                if (!block.values.command || block.values.command.trim() === '') {
                    return false;
                }
            }
            return true;
        },
        message: '❌ RUN命令にコマンドが指定されていません。',
        severity: 'error',
        help: 'RUN命令には実行するコマンドを指定する必要があります。'
    },
    
    // 空のFROMイメージ
    emptyFromImage: {
        check: (blocks) => {
            const fromBlocks = blocks.filter(block => block.type === 'FROM');
            for (let block of fromBlocks) {
                if (!block.values.image || block.values.image.trim() === '') {
                    return false;
                }
            }
            return true;
        },
        message: '❌ FROM命令にイメージが指定されていません。',
        severity: 'error',
        help: 'FROM命令にはベースイメージ（例: ubuntu:22.04）を指定する必要があります。'
    },
    
    // COPYのソースとデスティネーションが指定されているか
    validateCopyPaths: {
        check: (blocks) => {
            const copyBlocks = blocks.filter(block => block.type === 'COPY' || block.type === 'ADD');
            for (let block of copyBlocks) {
                if (!block.values.source || !block.values.dest) {
                    return false;
                }
            }
            return true;
        },
        message: '❌ COPY/ADD命令にコピー元またはコピー先が指定されていません。',
        severity: 'error',
        help: 'COPY/ADD命令には、コピー元とコピー先の両方を指定する必要があります。'
    },
    
    // ENVのキーと値が指定されているか
    validateEnvKeyValue: {
        check: (blocks) => {
            const envBlocks = blocks.filter(block => block.type === 'ENV');
            for (let block of envBlocks) {
                if (!block.values.key || !block.values.value) {
                    return false;
                }
            }
            return true;
        },
        message: '❌ ENV命令に変数名または値が指定されていません。',
        severity: 'error',
        help: 'ENV命令には環境変数名と値の両方を指定する必要があります。'
    }
};

// バリデーションを実行
function validateDockerfile() {
    const canvas = document.getElementById('canvas');
    const canvasBlocks = canvas.querySelectorAll('.canvas-block');
    
    // ブロックデータを配列に変換
    const blocks = Array.from(canvasBlocks).map(blockElement => {
        const blockId = blockElement.dataset.blockId;
        const blockData = canvasBlocksData[blockId];
        return blockData;
    }).filter(block => block !== undefined);
    
    // バリデーション結果
    const results = {
        errors: [],
        warnings: [],
        isValid: true
    };
    
    // 各ルールをチェック
    for (let ruleName in validationRules) {
        const rule = validationRules[ruleName];
        if (!rule.check(blocks)) {
            const result = {
                message: rule.message,
                help: rule.help,
                severity: rule.severity
            };
            
            if (rule.severity === 'error') {
                results.errors.push(result);
                results.isValid = false;
            } else {
                results.warnings.push(result);
            }
        }
    }
    
    return results;
}

// バリデーション結果を表示
function displayValidationResults(results) {
    const validationPanel = document.getElementById('validationPanel');
    const validationContent = document.getElementById('validationContent');
    
    if (!validationPanel || !validationContent) return;
    
    // 結果をクリア
    validationContent.innerHTML = '';
    
    if (results.errors.length === 0 && results.warnings.length === 0) {
        // 問題なし
        validationContent.innerHTML = `
            <div class="validation-success">
                <div class="validation-icon">✅</div>
                <div class="validation-message">
                    <strong>完璧です！</strong><br>
                    Dockerfileに問題は見つかりませんでした。
                </div>
            </div>
        `;
        validationPanel.classList.remove('has-errors', 'has-warnings');
        validationPanel.classList.add('has-success');
    } else {
        // エラーまたは警告あり
        let html = '';
        
        // エラー表示
        if (results.errors.length > 0) {
            results.errors.forEach(error => {
                html += `
                    <div class="validation-item validation-error">
                        <div class="validation-icon">❌</div>
                        <div class="validation-message">
                            <strong>${error.message}</strong><br>
                            <small>${error.help}</small>
                        </div>
                    </div>
                `;
            });
            validationPanel.classList.add('has-errors');
        }
        
        // 警告表示
        if (results.warnings.length > 0) {
            results.warnings.forEach(warning => {
                html += `
                    <div class="validation-item validation-warning">
                        <div class="validation-icon">⚠️</div>
                        <div class="validation-message">
                            <strong>${warning.message}</strong><br>
                            <small>${warning.help}</small>
                        </div>
                    </div>
                `;
            });
            validationPanel.classList.add('has-warnings');
        }
        
        validationContent.innerHTML = html;
        validationPanel.classList.remove('has-success');
    }
    
    // パネルを表示
    validationPanel.style.display = 'block';
}

// バリデーションボタンのハンドラ
function handleValidationClick() {
    const results = validateDockerfile();
    displayValidationResults(results);
    
    // バリデーションパネルにスクロール
    const validationPanel = document.getElementById('validationPanel');
    if (validationPanel) {
        validationPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// 自動バリデーション（ブロック変更時）
function autoValidate() {
    const results = validateDockerfile();
    
    // バリデーションバッジを更新
    updateValidationBadge(results);
    
    return results;
}

// バリデーションバッジを更新
function updateValidationBadge(results) {
    const validateBtn = document.getElementById('validateBtn');
    if (!validateBtn) return;
    
    // 既存のバッジを削除
    const existingBadge = validateBtn.querySelector('.validation-badge');
    if (existingBadge) {
        existingBadge.remove();
    }
    
    // 新しいバッジを追加
    if (results.errors.length > 0) {
        const badge = document.createElement('span');
        badge.className = 'validation-badge badge-error';
        badge.textContent = results.errors.length;
        validateBtn.appendChild(badge);
    } else if (results.warnings.length > 0) {
        const badge = document.createElement('span');
        badge.className = 'validation-badge badge-warning';
        badge.textContent = results.warnings.length;
        validateBtn.appendChild(badge);
    }
}

// バリデーション機能の初期化
function initializeValidation() {
    const validateBtn = document.getElementById('validateBtn');
    if (validateBtn) {
        validateBtn.addEventListener('click', handleValidationClick);
    }
    
    // 初回バリデーション
    autoValidate();
}

