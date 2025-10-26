# 🎩 Container File Builder

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](https://opensource.org/licenses/MIT)
[![Language: JavaScript](https://img.shields.io/badge/Language-JavaScript-yellow.svg)](https://www.javascript.com/)
[![Platform: Web](https://img.shields.io/badge/Platform-Web-blue.svg)](https://developer.mozilla.org/en-US/docs/Web)
[![GitHub Pages](https://img.shields.io/badge/Demo-GitHub%20Pages-brightgreen.svg)](https://lab8010.github.io/container-file-builder/)

**子供向けビジュアルプログラミングツール - Scratchライクな操作でContainerfile/Dockerfileを簡単に作成！**

Container File Builderは、Scratchのような直感的なドラッグ&ドロップUIを使って、Containerfile（Dockerfile）を視覚的に作成できる教育用ツールです。プログラミング初心者やコンテナ技術を学び始めた方に最適です。

Red Hat Enterprise Linux、Fedora、CentOS Streamなど、Red Hat系ディストリビューションに最適化されています。

![Container File Builder Screenshot](https://img.shields.io/badge/Status-Ready%20to%20Use-brightgreen.svg)

---

## ✨ 主な機能

### 🎨 ビジュアルプログラミング
- **ドラッグ&ドロップ操作**: ブロックをキャンバスにドラッグして配置
- **リアルタイムプレビュー**: 作成中のContainerfileを即座に確認
- **並び替え可能**: ブロックの順序を自由に変更

### 📦 全14種類の命令ブロック
| カテゴリ | 命令 | 説明 |
|---------|------|------|
| **基本命令** | FROM, RUN | ベースイメージ選択、コマンド実行 |
| **ファイル操作** | WORKDIR, COPY, ADD | 作業ディレクトリ、ファイルコピー |
| **実行命令** | CMD, ENTRYPOINT | コンテナ起動時の処理 |
| **その他** | ENV, EXPOSE, USER, VOLUME, LABEL, ARG, SHELL | 環境変数、ポート公開など |

### 🎮 3つのサンプルContainerfile
1. **静的Webサーバー（初級 ⭐）**: Apache httpdを使った基本構成
2. **ブロック崩しゲーム（中級 ⭐⭐）**: HTML5 Canvas + nginx
3. **マルチステージビルド（上級 ⭐⭐⭐）**: Goアプリの最適化ビルド

### 🌐 多言語対応
- 日本語 / English 切り替え可能
- すべてのUI要素、ブロック説明、メッセージが翻訳対応

### 🔴 Red Hat最適化
- Fedora、CentOS Stream、UBI（Universal Base Image）をデフォルト採用
- dnf/yumパッケージマネージャーの例
- Red Hatカラーテーマ（赤基調のデザイン）
- Red Hat Container Registry、Quay.io、Docker Hubのヒント情報

---

## 🚀 セットアップ

### 🌐 オンラインデモ（推奨）

**インストール不要！今すぐブラウザで試せます：**

👉 **https://lab8010.github.io/container-file-builder/**

### ローカル環境での実行

#### 必要な環境
- モダンなWebブラウザ（Chrome、Firefox、Safari、Edgeなど）
- Python 3（ローカルサーバー起動用、オプション）

#### インストール手順

1. **リポジトリをクローン**
```bash
git clone https://github.com/Lab8010/container-file-builder.git
cd container-file-builder
```

2. **ローカルサーバーを起動**
```bash
python3 -m http.server 8000
```

3. **ブラウザでアクセス**
```
http://localhost:8000
```

### その他の起動方法

#### Node.js の場合
```bash
npx http-server -p 8000
```

#### VS Code Live Server の場合
`index.html` を右クリック → "Open with Live Server"

---

## 📖 使い方

### 基本的な流れ

1. **ベースイメージを選択**
   - 左側のパレットから「FROM」ブロックをキャンバスにドラッグ
   - 編集ボタン（✏️）をクリックして`fedora:39`などを指定

2. **命令を追加**
   - 必要なブロック（RUN、COPY、CMDなど）をドラッグ
   - 各ブロックを編集して値を入力

3. **順序を調整**
   - ブロックをドラッグして並び替え
   - ドロップ時に赤いラインが表示されます

4. **プレビュー確認**
   - 右側にリアルタイムでContainerfileが表示
   - 「📋 コピー」ボタンでクリップボードにコピー

5. **ダウンロード**
   - 「ダウンロード」ボタンで`Containerfile`を保存
   - Podman/Dockerでビルド可能

### サンプルから始める

初心者の方は、ヘッダー下の**サンプルカード**をクリックしてみてください：

- 🌐 **静的Webサーバー**: HTMLファイルを配信する基本構成を学習
- 🎮 **ブロック崩しゲーム**: ゲームを動かしながらコンテナを理解
- 🚀 **マルチステージビルド**: 最適化されたコンテナイメージの作り方

---

## 🎯 動作例

### 生成されるContainerfileの例（静的Webサーバー）

```dockerfile
# Container File Builderによって生成
# 作成日時: 2025-10-26 20:00:00

FROM fedora:39
RUN dnf install -y httpd && dnf clean all
COPY index.html /var/www/html/
EXPOSE 80
CMD /usr/sbin/httpd -D FOREGROUND
```

### ビルドと実行

```bash
# Podmanの場合
podman build -t my-webserver -f Containerfile .
podman run -d -p 8080:80 my-webserver

# Dockerの場合
docker build -t my-webserver -f Containerfile .
docker run -d -p 8080:80 my-webserver
```

---

## 🛠️ 技術スタック

- **フロントエンド**: Pure HTML5, CSS3, JavaScript（バニラJS）
- **ドラッグ&ドロップ**: HTML5 Drag and Drop API
- **ローカルストレージ**: 言語設定の保存
- **デザイン**: レスポンシブデザイン、Red Hatカラーテーマ

### ファイル構成

```
container-file-builder/
├── index.html              # メインHTML
├── css/
│   └── style.css          # スタイルシート
├── js/
│   ├── blocks.js          # ブロック定義（全14種類）
│   ├── samples.js         # サンプルContainerfile
│   ├── dragdrop.js        # ドラッグ&ドロップロジック
│   ├── preview.js         # プレビュー生成
│   ├── i18n.js            # 多言語対応
│   └── app.js             # メインアプリケーション
├── README.md              # このファイル
└── LICENSE                # MITライセンス
```

---

## 📝 ライセンス

このプロジェクトは **MIT License** の下で公開されています。

### ✅ 許可されること
- ✅ 個人利用
- ✅ 商用利用
- ✅ 修正・改変
- ✅ 再配布
- ✅ ソースコードの公開・非公開

### ⚠️ 商用利用時の重要な注意事項

**このツールで生成されたContainerfile/Dockerfileを商用環境で使用する場合は、必ず以下を実施してください：**

1. **動作検証の実施**
   - 生成されたContainerfileが、あなたの環境で正しく動作することを確認
   - セキュリティ、パフォーマンス、互換性の検証

2. **本番環境での事前テスト**
   - 開発環境、ステージング環境でのテスト
   - 負荷テスト、脆弱性スキャンの実施

3. **責任の所在**
   - 生成されたファイルの動作保証はありません
   - 商用利用による損害について、開発者は一切の責任を負いません

詳細は [LICENSE](LICENSE) ファイルをご確認ください。

---

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！

### 貢献方法

1. **Issueを作成**
   - バグ報告、機能提案、質問など

2. **Pull Requestを送信**
   ```bash
   # フォーク後
   git clone https://github.com/YOUR_USERNAME/container-file-builder.git
   cd container-file-builder
   git checkout -b feature/your-feature-name
   
   # 変更を加えてコミット
   git add .
   git commit -m "Add: your feature description"
   git push origin feature/your-feature-name
   ```

3. **改善案の例**
   - 新しいブロックの追加（HEALTHCHECK、STOPSIGNALなど）
   - 他のディストリビューション対応（Ubuntu、Alpine、Debianなど）
   - UI/UXの改善
   - 新しいサンプルの追加
   - 翻訳の追加（中国語、韓国語など）

### 開発ガイドライン

- コードは読みやすく、コメントを適切に
- 既存のコーディングスタイルに従う
- 新機能は日本語と英語の両方に対応
- サンプルは実際に動作するものを

---

## 🐛 既知の問題

現在、既知の重大な問題はありません。

問題を発見した場合は、[Issues](https://github.com/Lab8010/container-file-builder/issues)でご報告ください。

---

## 📚 参考リンク

- **Red Hat コンテナーレジストリーの認証**: https://access.redhat.com/ja/articles/4259601
- **Podman 公式ドキュメント**: https://docs.podman.io/
- **Dockerfile リファレンス**: https://docs.docker.com/engine/reference/builder/
- **Fedora Container Images**: https://registry.fedoraproject.org/
- **Red Hat UBI**: https://www.redhat.com/en/blog/introducing-red-hat-universal-base-image

---

## 🎓 教育目的での使用

このツールは教育目的で作成されました。以下のような用途に最適です：

- **プログラミング教室**: 子供たちへのコンテナ技術の導入
- **企業研修**: 新入社員へのDocker/Podman研修
- **大学・専門学校**: コンテナ技術の授業教材
- **個人学習**: コンテナファイルの構文学習

---

## 💬 サポート

質問や問題がある場合：

1. まず [README](README.md) を確認
2. [Issues](https://github.com/Lab8010/container-file-builder/issues) で既存の質問を検索
3. 見つからなければ新しいIssueを作成

---

## 🌟 スターをお願いします！

このプロジェクトが役に立った場合は、GitHubで⭐をつけていただけると嬉しいです！

---

## 👥 作者

**Container File Builder** は教育とコミュニティのために作られました。

- Red Hat製品をこよなく愛するエンジニアによって開発
- Scratchのような直感的UIでコンテナ技術を学べるツールを目指して

---

## 📅 更新履歴

### v1.0.0 (2025-10-26)
- 🎉 初回リリース
- 全14種類のブロック実装
- 3つのサンプルContainerfile
- 日本語/英語対応
- Red Hat最適化
- マルチステージビルド対応

---

**Happy Container Building! 🎩🚀**
