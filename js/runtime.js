// Docker/Podman ランタイム切り替え機能
let currentRuntime = localStorage.getItem('containerRuntime') || 'podman'; // デフォルトはPodman（Red Hat推奨）

// DOMContentLoadedでランタイムを初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeRuntime();
    setupRuntimeToggle();
});

// ランタイムを初期化
function initializeRuntime() {
    applyRuntime(currentRuntime);
}

// ランタイム切り替えボタンのセットアップ
function setupRuntimeToggle() {
    const runtimeToggle = document.getElementById('runtimeToggle');
    if (runtimeToggle) {
        runtimeToggle.addEventListener('click', toggleRuntime);
    }
}

// ランタイムを切り替える
function toggleRuntime() {
    currentRuntime = currentRuntime === 'docker' ? 'podman' : 'docker';
    localStorage.setItem('containerRuntime', currentRuntime);
    applyRuntime(currentRuntime);
    
    // プレビューも更新
    if (typeof updatePreview === 'function') {
        updatePreview();
    }
    
    // ブロックの説明も更新
    if (typeof updateBlockDescriptions === 'function') {
        updateBlockDescriptions(getCurrentLanguage());
    }
}

// ランタイムを適用
function applyRuntime(runtime) {
    // ボタンの表示を更新
    const runtimeIcon = document.getElementById('runtimeIcon');
    const runtimeName = document.getElementById('runtimeName');
    
    if (runtimeIcon && runtimeName) {
        if (runtime === 'docker') {
            runtimeIcon.textContent = '🐳';
            runtimeName.textContent = 'Docker';
        } else {
            runtimeIcon.textContent = '🎩';
            runtimeName.textContent = 'Podman';
        }
    }
    
    // ランタイム情報パネルを更新
    updateRuntimeInfo(runtime);
}

// ランタイム情報パネルを更新
function updateRuntimeInfo(runtime) {
    const runtimeInfo = document.getElementById('runtimeInfo');
    if (!runtimeInfo) return;
    
    const lang = getCurrentLanguage();
    
    if (runtime === 'podman') {
        runtimeInfo.innerHTML = lang === 'ja' ? `
            <div class="runtime-info-header">
                <span class="runtime-badge podman">🎩 Podman モード</span>
            </div>
            <div class="runtime-info-content">
                <h4>✨ Podman の特徴</h4>
                <ul>
                    <li><strong>Rootless実行</strong>: root権限不要でセキュア</li>
                    <li><strong>Daemonless</strong>: バックグラウンドプロセス不要</li>
                    <li><strong>Red Hat推奨</strong>: RHEL/Fedora標準</li>
                    <li><strong>Dockerと互換</strong>: <code>alias docker=podman</code> で使用可能</li>
                </ul>
                <h4>💡 ベストプラクティス</h4>
                <ul>
                    <li>非rootユーザーで実行（<code>USER 1000</code>）</li>
                    <li>UBIやFedoraイメージを推奨</li>
                    <li>ポートは1024以上を使用（rootless環境）</li>
                </ul>
            </div>
        ` : `
            <div class="runtime-info-header">
                <span class="runtime-badge podman">🎩 Podman Mode</span>
            </div>
            <div class="runtime-info-content">
                <h4>✨ Podman Features</h4>
                <ul>
                    <li><strong>Rootless</strong>: Secure without root privileges</li>
                    <li><strong>Daemonless</strong>: No background process required</li>
                    <li><strong>Red Hat Standard</strong>: Default on RHEL/Fedora</li>
                    <li><strong>Docker Compatible</strong>: Use <code>alias docker=podman</code></li>
                </ul>
                <h4>💡 Best Practices</h4>
                <ul>
                    <li>Run as non-root user (<code>USER 1000</code>)</li>
                    <li>Prefer UBI or Fedora images</li>
                    <li>Use ports above 1024 (rootless)</li>
                </ul>
            </div>
        `;
    } else {
        runtimeInfo.innerHTML = lang === 'ja' ? `
            <div class="runtime-info-header">
                <span class="runtime-badge docker">🐳 Docker モード</span>
            </div>
            <div class="runtime-info-content">
                <h4>✨ Docker の特徴</h4>
                <ul>
                    <li><strong>業界標準</strong>: 最も広く使用されている</li>
                    <li><strong>豊富なエコシステム</strong>: Docker Hub、Compose等</li>
                    <li><strong>幅広いサポート</strong>: 多くのプラットフォーム対応</li>
                    <li><strong>成熟した技術</strong>: 豊富なドキュメント</li>
                </ul>
                <h4>💡 ベストプラクティス</h4>
                <ul>
                    <li>Docker Hubの公式イメージを使用</li>
                    <li>マルチステージビルドで最適化</li>
                    <li>.dockerignoreでビルド高速化</li>
                </ul>
            </div>
        ` : `
            <div class="runtime-info-header">
                <span class="runtime-badge docker">🐳 Docker Mode</span>
            </div>
            <div class="runtime-info-content">
                <h4>✨ Docker Features</h4>
                <ul>
                    <li><strong>Industry Standard</strong>: Most widely used</li>
                    <li><strong>Rich Ecosystem</strong>: Docker Hub, Compose, etc.</li>
                    <li><strong>Broad Support</strong>: Many platforms</li>
                    <li><strong>Mature Technology</strong>: Extensive documentation</li>
                </ul>
                <h4>💡 Best Practices</h4>
                <ul>
                    <li>Use official images from Docker Hub</li>
                    <li>Optimize with multi-stage builds</li>
                    <li>Use .dockerignore for faster builds</li>
                </ul>
            </div>
        `;
    }
}

// 現在のランタイムを取得
function getCurrentRuntime() {
    return currentRuntime;
}

// ランタイム固有のアドバイスを取得
function getRuntimeAdvice(blockType) {
    const lang = getCurrentLanguage();
    const runtime = getCurrentRuntime();
    
    const advice = {
        podman: {
            FROM: {
                ja: '💡 Podman推奨: UBI (ubi9/ubi) や Fedora イメージが最適です。Red Hatエコシステムとの統合がスムーズです。',
                en: '💡 Podman Tip: UBI (ubi9/ubi) or Fedora images are optimal. Better integration with Red Hat ecosystem.'
            },
            USER: {
                ja: '🔒 Podman推奨: Rootless実行のため、非rootユーザー（例: USER 1000）の指定を強く推奨します。',
                en: '🔒 Podman Tip: Highly recommended to specify non-root user (e.g., USER 1000) for rootless execution.'
            },
            EXPOSE: {
                ja: '⚠️ Podman注意: Rootless環境では1024未満のポートは使用できません。8080、3000等を推奨。',
                en: '⚠️ Podman Note: Ports below 1024 are not available in rootless mode. Use 8080, 3000, etc.'
            },
            VOLUME: {
                ja: '📁 Podman注意: Rootless環境ではパーミッション管理に注意。適切なUID/GID設定が必要です。',
                en: '📁 Podman Note: Be careful with permissions in rootless mode. Proper UID/GID setup required.'
            }
        },
        docker: {
            FROM: {
                ja: '💡 Docker推奨: Docker Hubの公式イメージ（node, python, nginx等）が豊富で安全です。',
                en: '💡 Docker Tip: Official images from Docker Hub (node, python, nginx, etc.) are abundant and secure.'
            },
            USER: {
                ja: '🔒 Docker推奨: セキュリティのため、rootユーザーでの実行は避けましょう。',
                en: '🔒 Docker Tip: Avoid running as root user for better security.'
            },
            EXPOSE: {
                ja: '💡 Docker注意: EXPOSEはドキュメント目的。実際のポート公開は docker run -p で指定します。',
                en: '💡 Docker Note: EXPOSE is for documentation. Use docker run -p for actual port mapping.'
            },
            VOLUME: {
                ja: '📁 Docker推奨: 名前付きボリュームを使用すると、データ管理が容易になります。',
                en: '📁 Docker Tip: Named volumes make data management easier.'
            }
        }
    };
    
    const runtimeAdvice = advice[runtime][blockType];
    if (runtimeAdvice) {
        return lang === 'ja' ? runtimeAdvice.ja : runtimeAdvice.en;
    }
    
    return '';
}

// ビルド・実行コマンドを取得
function getBuildRunCommands() {
    const runtime = getCurrentRuntime();
    const lang = getCurrentLanguage();
    
    if (runtime === 'podman') {
        return lang === 'ja' ? `
# Podman でビルド
podman build -t my-container -f Containerfile .

# Podman で実行（Rootless）
podman run -d -p 8080:8080 my-container

# コンテナ一覧
podman ps

# ログ確認
podman logs <container-id>
        `.trim() : `
# Build with Podman
podman build -t my-container -f Containerfile .

# Run with Podman (Rootless)
podman run -d -p 8080:8080 my-container

# List containers
podman ps

# Check logs
podman logs <container-id>
        `.trim();
    } else {
        return lang === 'ja' ? `
# Docker でビルド
docker build -t my-container -f Containerfile .

# Docker で実行
docker run -d -p 8080:8080 my-container

# コンテナ一覧
docker ps

# ログ確認
docker logs <container-id>
        `.trim() : `
# Build with Docker
docker build -t my-container -f Containerfile .

# Run with Docker
docker run -d -p 8080:8080 my-container

# List containers
docker ps

# Check logs
docker logs <container-id>
        `.trim();
    }
}

