// コマンド文字列を引用符を考慮して分割する関数
function parseCommand(cmd) {
    const parts = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    
    for (let i = 0; i < cmd.length; i++) {
        const char = cmd[i];
        
        if ((char === '"' || char === "'") && !inQuotes) {
            inQuotes = true;
            quoteChar = char;
        } else if (char === quoteChar && inQuotes) {
            inQuotes = false;
            quoteChar = '';
        } else if (char === ' ' && !inQuotes) {
            if (current.trim()) {
                parts.push(current.trim());
                current = '';
            }
        } else {
            current += char;
        }
    }
    
    if (current.trim()) {
        parts.push(current.trim());
    }
    
    return parts.length > 0 ? parts : ['bash'];
}

// Dockerfileの各命令ブロックの定義
const blockDefinitions = {
    // 基本命令
    FROM: {
        type: 'FROM',
        category: 'basic',
        className: 'block-from',
        description: '🏗️ 必ず最初に配置！コンテナの土台となるOS・環境を選択',
        description_en: '🏗️ Must be first! Select the base OS/environment',
        fields: [
            {
                name: 'image',
                label: 'イメージ名',
                type: 'text',
                placeholder: 'fedora:39',
                required: true,
                help: '【主要なコンテナレジストリ】\n\n🔴 Red Hat Registry (registry.access.redhat.com, registry.redhat.io)\n  • ubi9/ubi:latest - Red Hat Universal Base Image\n  • fedora:39 - Fedora Linux\n  • centos:stream9 - CentOS Stream\n  📚 詳細: https://access.redhat.com/ja/articles/4259601\n\n🐳 Docker Hub (docker.io)\n  • node:18 - Node.js環境\n  • python:3.11 - Python環境\n  • nginx:latest - Nginxサーバー\n\n🔷 Quay.io (quay.io)\n  • quay.io/fedora/fedora:39\n  • quay.io/centos/centos:stream9\n\nレジストリを省略するとDocker Hubが使用されます。'
            },
            {
                name: 'asName',
                label: 'ステージ名 (オプション)',
                type: 'text',
                placeholder: 'builder',
                required: false,
                help: 'マルチステージビルドで使用するステージ名。後のステージから参照できます（例：builder）'
            }
        ],
        generate: (values) => {
            const asName = values.asName ? ` AS ${values.asName}` : '';
            return `FROM ${values.image || 'fedora:39'}${asName}`;
        }
    },
    
    RUN: {
        type: 'RUN',
        category: 'exec',
        className: 'block-run',
        description: '🔨 ビルド時に1回だけ実行。ソフトのインストールや設定に使用',
        description_en: '🔨 Execute once at build time. For installing packages',
        fields: [
            {
                name: 'command',
                label: 'コマンド',
                type: 'textarea',
                placeholder: 'dnf install -y curl git',
                required: true,
                help: '使い所：パッケージのインストール(dnf/yum)、ファイルの移動・削除、設定変更など。コンテナを作る時だけ実行されます'
            }
        ],
        generate: (values) => {
            return `RUN ${values.command || 'echo "Hello"'}`;
        }
    },
    
    CMD: {
        type: 'CMD',
        category: 'exec',
        className: 'block-cmd',
        description: '🚀 コンテナ起動時に毎回実行。アプリの起動コマンドを指定',
        description_en: '🚀 Run every time container starts. App launch command',
        fields: [
            {
                name: 'command',
                label: 'コマンド',
                type: 'text',
                placeholder: 'npm start',
                required: true,
                help: '使い所：Webサーバー起動(npm start)、アプリ実行(python app.py)など。起動の度に実行。docker run時に上書き可能'
            }
        ],
        generate: (values) => {
            const cmd = values.command || 'bash';
            // 引用符を考慮してコマンドを分割
            const parts = parseCommand(cmd);
            return `CMD ${JSON.stringify(parts)}`;
        }
    },
    
    // ファイル操作
    COPY: {
        type: 'COPY',
        category: 'file',
        className: 'block-copy',
        description: '📁 ローカルのファイルをコンテナにコピー。基本的にはこちらを使用',
        description_en: '📁 Copy local files to container. Use this by default',
        fields: [
            {
                name: 'source',
                label: 'コピー元',
                type: 'text',
                placeholder: './app',
                required: true,
                help: 'PC上のファイルパス。相対パス推奨'
            },
            {
                name: 'dest',
                label: 'コピー先',
                type: 'text',
                placeholder: '/app',
                required: true,
                help: 'コンテナ内の配置先。絶対パス推奨。ADDより安全でシンプル'
            }
        ],
        generate: (values) => {
            return `COPY ${values.source || '.'} ${values.dest || '/app'}`;
        }
    },
    
    ADD: {
        type: 'ADD',
        category: 'file',
        className: 'block-add',
        description: '📦 URLダウンロードやtar自動解凍が必要な時のみ使用',
        description_en: '📦 Use only for URL download or tar auto-extraction',
        fields: [
            {
                name: 'source',
                label: '追加元',
                type: 'text',
                placeholder: 'https://example.com/file.tar.gz',
                required: true,
                help: 'URL指定可、tar.gzを自動解凍。通常のファイルコピーはCOPYを使うのが推奨'
            },
            {
                name: 'dest',
                label: '追加先',
                type: 'text',
                placeholder: '/app',
                required: true,
                help: 'コンテナ内のパス。COPYとの違い：より多機能だが予期せぬ動作のリスクあり'
            }
        ],
        generate: (values) => {
            return `ADD ${values.source || '.'} ${values.dest || '/app'}`;
        }
    },
    
    WORKDIR: {
        type: 'WORKDIR',
        category: 'file',
        className: 'block-workdir',
        description: '📂 以降の作業場所を指定。cdコマンドの永続版',
        description_en: '📂 Set working directory. Persistent cd command',
        fields: [
            {
                name: 'path',
                label: 'ディレクトリパス',
                type: 'text',
                placeholder: '/app',
                required: true,
                help: '使い所：ファイルコピーやコマンド実行の基準位置。指定後のRUN、COPY、CMDはこのディレクトリが基準になります'
            }
        ],
        generate: (values) => {
            return `WORKDIR ${values.path || '/app'}`;
        }
    },
    
    // 環境設定
    ENV: {
        type: 'ENV',
        category: 'other',
        className: 'block-env',
        description: '⚙️ 環境変数を設定。アプリの動作モードや設定値を指定',
        description_en: '⚙️ Set environment variables. Configure app behavior',
        fields: [
            {
                name: 'key',
                label: '変数名',
                type: 'text',
                placeholder: 'NODE_ENV',
                required: true,
                help: '変数名は大文字が慣例（例：NODE_ENV、DB_HOST）'
            },
            {
                name: 'value',
                label: '値',
                type: 'text',
                placeholder: 'production',
                required: true,
                help: '使い所：本番/開発の切替(NODE_ENV=production)、APIキー、DBホスト名など。ビルド後も残り、実行時に参照可能'
            }
        ],
        generate: (values) => {
            return `ENV ${values.key || 'KEY'}=${values.value || 'value'}`;
        }
    },
    
    EXPOSE: {
        type: 'EXPOSE',
        category: 'other',
        className: 'block-expose',
        description: '🌐 アプリが使うポートを宣言。ドキュメント的な役割',
        description_en: '🌐 Declare app port. Documentation purpose',
        fields: [
            {
                name: 'port',
                label: 'ポート番号',
                type: 'text',
                placeholder: '8080',
                required: true,
                help: '使い所：Webサーバー(80,443,8080)、DB(3306,5432)など。実際の公開には docker run -p が必要ですが、どのポートを使うかの目印になります'
            }
        ],
        generate: (values) => {
            return `EXPOSE ${values.port || '8080'}`;
        }
    },
    
    USER: {
        type: 'USER',
        category: 'other',
        className: 'block-user',
        description: '👤 実行ユーザーを変更。セキュリティ向上のため非rootで実行',
        description_en: '👤 Change execution user. Run as non-root for security',
        fields: [
            {
                name: 'username',
                label: 'ユーザー名',
                type: 'text',
                placeholder: 'node',
                required: true,
                help: '使い所：root権限が不要なアプリは一般ユーザーで実行すると安全。事前にRUNでuseraddが必要な場合あり'
            }
        ],
        generate: (values) => {
            return `USER ${values.username || 'root'}`;
        }
    },
    
    VOLUME: {
        type: 'VOLUME',
        category: 'other',
        className: 'block-volume',
        description: '💾 データ保存場所を宣言。コンテナ削除後もデータが残る',
        description_en: '💾 Declare data storage. Data persists after deletion',
        fields: [
            {
                name: 'path',
                label: 'マウントポイント',
                type: 'text',
                placeholder: '/data',
                required: true,
                help: '使い所：DB(/var/lib/mysql)、ログ(/var/log)、アップロードファイルなど。コンテナを消しても残したいデータはここに置きます'
            }
        ],
        generate: (values) => {
            return `VOLUME ${JSON.stringify([values.path || '/data'])}`;
        }
    },
    
    ENTRYPOINT: {
        type: 'ENTRYPOINT',
        category: 'exec',
        className: 'block-entrypoint',
        description: '🎯 必ず実行するコマンド。CMDと違い上書き不可',
        description_en: '🎯 Always execute this command. Cannot override',
        fields: [
            {
                name: 'command',
                label: 'コマンド',
                type: 'text',
                placeholder: 'docker-entrypoint.sh',
                required: true,
                help: 'CMDとの違い：ENTRYPOINTは必ず実行、CMDは引数的な扱い。docker run時にコマンドを変更されたくない場合に使用'
            }
        ],
        generate: (values) => {
            const cmd = values.command || 'sh';
            // 引用符を考慮してコマンドを分割
            const parts = parseCommand(cmd);
            return `ENTRYPOINT ${JSON.stringify(parts)}`;
        }
    },
    
    LABEL: {
        type: 'LABEL',
        category: 'other',
        className: 'block-label',
        description: '🏷️ イメージに情報タグを付与。バージョン管理や作者情報',
        description_en: '🏷️ Add metadata tags. Version and author info',
        fields: [
            {
                name: 'key',
                label: 'ラベル名',
                type: 'text',
                placeholder: 'version',
                required: true,
                help: '例：version, maintainer, description'
            },
            {
                name: 'value',
                label: '値',
                type: 'text',
                placeholder: '1.0.0',
                required: true,
                help: '使い所：バージョン番号、作者名、説明文など。動作には影響しないが管理に便利。docker inspectで確認可能'
            }
        ],
        generate: (values) => {
            return `LABEL ${values.key || 'key'}="${values.value || 'value'}"`;
        }
    },
    
    ARG: {
        type: 'ARG',
        category: 'other',
        className: 'block-arg',
        description: '🔧 ビルド時のみ使える変数。docker build時に値を変更可能',
        description_en: '🔧 Build-time only variables. Changeable at build',
        fields: [
            {
                name: 'name',
                label: '引数名',
                type: 'text',
                placeholder: 'NODE_VERSION',
                required: true,
                help: 'ビルド時のみ有効な変数'
            },
            {
                name: 'default',
                label: 'デフォルト値',
                type: 'text',
                placeholder: '18',
                required: false,
                help: 'ENVとの違い：ARGはビルド時のみ、ENVは実行時も有効。使い所：バージョン切替(docker build --build-arg NODE_VERSION=20)'
            }
        ],
        generate: (values) => {
            if (values.default) {
                return `ARG ${values.name || 'ARG'}=${values.default}`;
            }
            return `ARG ${values.name || 'ARG'}`;
        }
    },
    
    SHELL: {
        type: 'SHELL',
        category: 'other',
        className: 'block-shell',
        description: '🐚 RUN命令で使うシェルを変更。bash特有の機能が必要な時',
        description_en: '🐚 Change shell for RUN. When bash features needed',
        fields: [
            {
                name: 'shell',
                label: 'シェル',
                type: 'text',
                placeholder: '/bin/bash',
                required: true,
                help: '使い所：デフォルトは/bin/sh。bashの配列や高度な機能を使いたい場合に/bin/bashに変更。Windows版なら["cmd", "/S", "/C"]'
            }
        ],
        generate: (values) => {
            const shell = values.shell || '/bin/sh';
            return `SHELL ${JSON.stringify([shell, '-c'])}`;
        }
    }
};

// カテゴリ別にブロックを分類（順序指定）
const blocksByCategory = {
    basic: ['FROM'],
    file: ['WORKDIR', 'COPY', 'ADD'],  // WORKDIRを最初に
    exec: ['RUN', 'CMD', 'ENTRYPOINT'],
    other: ['ENV', 'EXPOSE', 'USER', 'VOLUME', 'LABEL', 'ARG', 'SHELL']
};

// ブロック要素を生成
function createBlockElement(blockType, isTemplate = true) {
    const def = blockDefinitions[blockType];
    const block = document.createElement('div');
    block.className = `block ${def.className}`;
    
    if (isTemplate) {
        block.setAttribute('draggable', 'true');
        block.dataset.blockType = blockType;
    }
    
    block.innerHTML = `
        <div class="block-type">${def.type}</div>
        <div class="block-description">${def.description}</div>
    `;
    
    return block;
}

// キャンバスブロック要素を生成
function createCanvasBlockElement(blockId, blockType, values = {}) {
    const def = blockDefinitions[blockType];
    const block = document.createElement('div');
    block.className = `canvas-block ${def.className}`;
    block.dataset.blockId = blockId;
    block.dataset.blockType = blockType;
    block.setAttribute('draggable', 'true');
    
    // 値の表示用テキスト生成
    let contentText = '';
    def.fields.forEach(field => {
        const value = values[field.name] || field.placeholder || '';
        contentText += `${field.label}: ${value}\n`;
    });
    
    block.innerHTML = `
        <div class="canvas-block-header">
            <div class="canvas-block-type">${def.type}</div>
            <div class="canvas-block-actions">
                <button class="block-action-btn edit-btn" title="編集">✏️</button>
                <button class="block-action-btn delete-btn" title="削除">🗑️</button>
            </div>
        </div>
        <div class="canvas-block-content">
            <code>${contentText.trim() || def.description}</code>
        </div>
    `;
    
    return block;
}

// ブロックの値を更新
function updateCanvasBlockContent(blockElement, values) {
    const blockType = blockElement.dataset.blockType;
    const def = blockDefinitions[blockType];
    
    let contentText = '';
    def.fields.forEach(field => {
        const value = values[field.name] || field.placeholder || '';
        contentText += `${field.label}: ${value}\n`;
    });
    
    const contentDiv = blockElement.querySelector('.canvas-block-content code');
    contentDiv.textContent = contentText.trim() || def.description;
}

