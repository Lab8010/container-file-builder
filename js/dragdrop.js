// ドラッグ&ドロップ機能の実装

let draggedElement = null;
let draggedBlockType = null;
let draggedFromCanvas = false;
let draggedCanvasBlockId = null;

// ドロップインジケーターをクリア
function clearDropIndicators() {
    const allBlocks = document.querySelectorAll('.canvas-block');
    allBlocks.forEach(block => {
        block.style.borderTop = '';
        block.style.borderBottom = '';
        block.style.marginTop = '';
        block.style.marginBottom = '';
        block.style.opacity = '';
    });
}

// ドラッグ開始
function handleDragStart(e) {
    draggedElement = e.target;
    
    // パレットからのドラッグかキャンバスからのドラッグか判定
    if (draggedElement.classList.contains('canvas-block')) {
        draggedFromCanvas = true;
        draggedCanvasBlockId = draggedElement.dataset.blockId;
        draggedBlockType = draggedElement.dataset.blockType;
    } else {
        draggedFromCanvas = false;
        draggedBlockType = draggedElement.dataset.blockType;
        draggedCanvasBlockId = null;
    }
    
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
}

// ドラッグ終了
function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedElement = null;
    
    // すべてのドロップインジケーターをクリア
    clearDropIndicators();
}

// ドラッグオーバー（キャンバス上）
function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'copy';
    return false;
}

// キャンバスに入った時
function handleDragEnter(e) {
    const canvas = document.getElementById('canvas');
    canvas.classList.add('drag-over');
}

// キャンバスから出た時
function handleDragLeave(e) {
    // キャンバス要素自体から出た場合のみ
    if (e.target.id === 'canvas') {
        const canvas = document.getElementById('canvas');
        canvas.classList.remove('drag-over');
    }
}

// ドロップ
function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    e.preventDefault();
    
    const canvas = document.getElementById('canvas');
    canvas.classList.remove('drag-over');
    
    // すべてのドロップインジケーターをクリア
    clearDropIndicators();
    
    if (draggedFromCanvas) {
        // キャンバス内での並び替え
        const targetBlock = e.target.closest('.canvas-block');
        const draggedBlock = document.querySelector(`[data-block-id="${draggedCanvasBlockId}"]`);
        
        if (targetBlock && draggedBlock && targetBlock !== draggedBlock) {
            const rect = targetBlock.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            
            if (e.clientY < midpoint) {
                canvas.insertBefore(draggedBlock, targetBlock);
            } else {
                canvas.insertBefore(draggedBlock, targetBlock.nextSibling);
            }
            
            // 並び替え後にFROMプロンプトを更新
            if (typeof updateFromPrompt === 'function') {
                updateFromPrompt();
            }
        } else if (!targetBlock) {
            // 空のキャンバスまたは最後に追加
            canvas.appendChild(draggedBlock);
            if (typeof updateFromPrompt === 'function') {
                updateFromPrompt();
            }
        }
    } else {
        // パレットからの新規追加
        if (draggedBlockType) {
            const blockId = 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            // デフォルト値を設定
            const def = blockDefinitions[draggedBlockType];
            const defaultValues = {};
            def.fields.forEach(field => {
                defaultValues[field.name] = field.placeholder || '';
            });
            
            // ブロックをストレージに追加
            addBlockToCanvas(blockId, draggedBlockType, defaultValues);
            
            // ドロップ位置を計算
            const targetBlock = e.target.closest('.canvas-block');
            const newBlock = document.querySelector(`[data-block-id="${blockId}"]`);
            
            if (targetBlock && newBlock) {
                const rect = targetBlock.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                
                if (e.clientY < midpoint) {
                    canvas.insertBefore(newBlock, targetBlock);
                } else {
                    canvas.insertBefore(newBlock, targetBlock.nextSibling);
                }
            }
            
            // モーダルを開いて編集を促す
            setTimeout(() => {
                openEditModal(blockId);
            }, 100);
        }
    }
    
    updatePreview();
    return false;
}

// キャンバスブロック上でのドラッグオーバー
function handleCanvasBlockDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    
    const targetBlock = e.target.closest('.canvas-block');
    if (!targetBlock) return;
    
    const rect = targetBlock.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    
    // すべてのインジケーターをクリア
    clearDropIndicators();
    
    // 視覚的なフィードバック - 挿入位置を明確に表示
    if (e.clientY < midpoint) {
        targetBlock.style.borderTop = '4px solid #CC0000';
        targetBlock.style.borderBottom = '';
        targetBlock.style.marginTop = '8px';
    } else {
        targetBlock.style.borderBottom = '4px solid #CC0000';
        targetBlock.style.borderTop = '';
        targetBlock.style.marginBottom = '8px';
    }
    
    // ドラッグ元のブロックを半透明に
    if (draggedFromCanvas && draggedCanvasBlockId) {
        const draggedBlock = document.querySelector(`[data-block-id="${draggedCanvasBlockId}"]`);
        if (draggedBlock) {
            draggedBlock.style.opacity = '0.4';
        }
    }
    
    e.dataTransfer.dropEffect = draggedFromCanvas ? 'move' : 'copy';
    return false;
}

// キャンバスブロックからドラッグが離れた時
function handleCanvasBlockDragLeave(e) {
    const targetBlock = e.target.closest('.canvas-block');
    if (targetBlock && !targetBlock.contains(e.relatedTarget)) {
        clearDropIndicators();
    }
}

// イベントリスナーを設定
function initializeDragDrop() {
    // パレットのブロックにドラッグイベントを設定
    const paletteBlocks = document.querySelectorAll('.blocks-container .block');
    paletteBlocks.forEach(block => {
        block.addEventListener('dragstart', handleDragStart);
        block.addEventListener('dragend', handleDragEnd);
    });
    
    // キャンバスにドロップイベントを設定
    const canvas = document.getElementById('canvas');
    canvas.addEventListener('dragover', handleDragOver);
    canvas.addEventListener('drop', handleDrop);
    canvas.addEventListener('dragenter', handleDragEnter);
    canvas.addEventListener('dragleave', handleDragLeave);
}

// キャンバスブロックのドラッグイベントを設定
function attachCanvasBlockDragEvents(blockElement) {
    blockElement.addEventListener('dragstart', handleDragStart);
    blockElement.addEventListener('dragend', handleDragEnd);
    blockElement.addEventListener('dragover', handleCanvasBlockDragOver);
    blockElement.addEventListener('dragleave', handleCanvasBlockDragLeave);
}

