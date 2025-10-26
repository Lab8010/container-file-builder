// メインアプリケーションロジック

// キャンバス上のブロックデータを保持
let canvasBlocksData = {};
let currentEditingBlockId = null;

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeLanguage();
    initializeBlockPalette();
    initializeDragDrop();
    initializePreview();
    initializeModal();
    updatePreview();
    updateFromPrompt();
});

// ブロックパレットを初期化
function initializeBlockPalette() {
    // 基本命令ブロック
    const basicContainer = document.getElementById('basicBlocks');
    blocksByCategory.basic.forEach(blockType => {
        const blockElement = createBlockElement(blockType, true);
        basicContainer.appendChild(blockElement);
    });
    
    // ファイル操作ブロック
    const fileContainer = document.getElementById('fileBlocks');
    blocksByCategory.file.forEach(blockType => {
        const blockElement = createBlockElement(blockType, true);
        fileContainer.appendChild(blockElement);
    });
    
    // 実行命令ブロック
    const execContainer = document.getElementById('execBlocks');
    blocksByCategory.exec.forEach(blockType => {
        const blockElement = createBlockElement(blockType, true);
        execContainer.appendChild(blockElement);
    });
    
    // その他のブロック
    const otherContainer = document.getElementById('otherBlocks');
    blocksByCategory.other.forEach(blockType => {
        const blockElement = createBlockElement(blockType, true);
        otherContainer.appendChild(blockElement);
    });
}

// キャンバスにブロックを追加
function addBlockToCanvas(blockId, blockType, values = {}) {
    const canvas = document.getElementById('canvas');
    
    // データを保存
    canvasBlocksData[blockId] = {
        type: blockType,
        values: values
    };
    
    // DOM要素を作成
    const blockElement = createCanvasBlockElement(blockId, blockType, values);
    canvas.appendChild(blockElement);
    canvas.classList.add('has-blocks');
    
    // イベントリスナーを設定
    attachCanvasBlockEvents(blockElement);
    
    // プレビューを更新
    updatePreview();
    
    // FROMプロンプトを更新
    updateFromPrompt();
    
    return blockElement;
}

// キャンバスブロックのイベントを設定
function attachCanvasBlockEvents(blockElement) {
    // ドラッグイベント
    attachCanvasBlockDragEvents(blockElement);
    
    // 編集ボタン
    const editBtn = blockElement.querySelector('.edit-btn');
    editBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const blockId = blockElement.dataset.blockId;
        openEditModal(blockId);
    });
    
    // 削除ボタン
    const deleteBtn = blockElement.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const blockId = blockElement.dataset.blockId;
        deleteBlock(blockId);
    });
}

// ブロックを削除
function deleteBlock(blockId) {
    const confirmMsg = typeof t === 'function' ? t('delete_confirm') : 'このブロックを削除しますか？';
    const confirmed = confirm(confirmMsg);
    if (confirmed) {
        const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
        if (blockElement) {
            blockElement.remove();
        }
        delete canvasBlocksData[blockId];
        updatePreview();
        updateFromPrompt();
    }
}

// FROMプロンプトメッセージの表示/非表示を更新
function updateFromPrompt() {
    const fromPrompt = document.getElementById('fromPrompt');
    if (!fromPrompt) return;
    
    // キャンバスにFROMブロックがあるかチェック
    const hasFROM = Object.values(canvasBlocksData).some(block => block.type === 'FROM');
    
    if (hasFROM) {
        fromPrompt.classList.add('hidden');
    } else {
        fromPrompt.classList.remove('hidden');
    }
}

// モーダルを初期化
function initializeModal() {
    const modal = document.getElementById('editModal');
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = document.getElementById('modalCancel');
    const saveBtn = document.getElementById('modalSave');
    
    // 閉じるボタン
    closeBtn.addEventListener('click', closeEditModal);
    cancelBtn.addEventListener('click', closeEditModal);
    
    // 保存ボタン
    saveBtn.addEventListener('click', saveBlockEdit);
    
    // モーダル外をクリックで閉じる
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeEditModal();
        }
    });
    
    // ESCキーで閉じる
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeEditModal();
        }
    });
}

// 編集モーダルを開く
function openEditModal(blockId) {
    currentEditingBlockId = blockId;
    const blockData = canvasBlocksData[blockId];
    
    if (!blockData) {
        console.error('Block data not found:', blockId);
        return;
    }
    
    const def = blockDefinitions[blockData.type];
    const modal = document.getElementById('editModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    // タイトルを設定
    modalTitle.textContent = `${def.type} ブロックを編集`;
    
    // フォームを生成
    let formHTML = '';
    def.fields.forEach(field => {
        const value = blockData.values[field.name] || '';
        
        formHTML += `
            <div class="form-group">
                <label for="field_${field.name}">${field.label}${field.required ? ' *' : ''}</label>
        `;
        
        if (field.type === 'textarea') {
            formHTML += `
                <textarea 
                    id="field_${field.name}" 
                    name="${field.name}"
                    placeholder="${field.placeholder || ''}"
                    ${field.required ? 'required' : ''}
                >${value}</textarea>
            `;
        } else {
            formHTML += `
                <input 
                    type="${field.type}" 
                    id="field_${field.name}" 
                    name="${field.name}"
                    value="${value}"
                    placeholder="${field.placeholder || ''}"
                    ${field.required ? 'required' : ''}
                />
            `;
        }
        
        if (field.help) {
            formHTML += `<div class="form-help">${field.help}</div>`;
        }
        
        formHTML += `</div>`;
    });
    
    modalBody.innerHTML = formHTML;
    
    // モーダルを表示
    modal.classList.add('active');
    
    // 最初のフィールドにフォーカス
    const firstField = modalBody.querySelector('input, textarea');
    if (firstField) {
        setTimeout(() => firstField.focus(), 100);
    }
}

// 編集モーダルを閉じる
function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.remove('active');
    currentEditingBlockId = null;
}

// ブロック編集を保存
function saveBlockEdit() {
    if (!currentEditingBlockId) return;
    
    const blockData = canvasBlocksData[currentEditingBlockId];
    if (!blockData) return;
    
    const def = blockDefinitions[blockData.type];
    const modalBody = document.getElementById('modalBody');
    const formElements = modalBody.querySelectorAll('input, textarea');
    
    // バリデーション
    let isValid = true;
    let newValues = {};
    
    formElements.forEach(element => {
        const fieldName = element.name;
        const value = element.value.trim();
        
        // 必須チェック
        if (element.required && !value) {
            element.style.borderColor = '#f44336';
            isValid = false;
        } else {
            element.style.borderColor = '';
            newValues[fieldName] = value;
        }
    });
    
    if (!isValid) {
        const alertMsg = typeof t === 'function' ? t('required_field') : '必須項目を入力してください';
        alert(alertMsg);
        return;
    }
    
    // データを更新
    blockData.values = newValues;
    
    // DOM要素を更新
    const blockElement = document.querySelector(`[data-block-id="${currentEditingBlockId}"]`);
    if (blockElement) {
        updateCanvasBlockContent(blockElement, newValues);
    }
    
    // プレビューを更新
    updatePreview();
    
    // FROMプロンプトを更新
    updateFromPrompt();
    
    // モーダルを閉じる
    closeEditModal();
}

// キーボードショートカット
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S でダウンロード
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleDownloadClick();
    }
    
    // Ctrl/Cmd + P でプレビュー更新
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handlePreviewClick();
    }
});

// ページを離れる前の確認
window.addEventListener('beforeunload', function(e) {
    if (Object.keys(canvasBlocksData).length > 0) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// ウェルカムメッセージ
console.log(`
🎩 Container File Builder へようこそ！

Red Hat系ディストリビューション（Fedora, CentOS Stream, UBI）に最適化されています。

使い方:
1. 左側のブロックをキャンバスにドラッグ
2. ブロックをクリックして編集
3. ✓ 動作チェックで正しく動くか確認
4. 右側でDockerfileをプレビュー
5. ダウンロードボタンでファイル保存

ショートカット:
- Ctrl/Cmd + S: ダウンロード
- Ctrl/Cmd + P: プレビュー更新
- ESC: モーダルを閉じる

楽しいコンテナファイル作成を！
`);

