# 🤝 Contributing to Container File Builder

まず、Container File Builderへの貢献を検討していただき、ありがとうございます！

このドキュメントでは、プロジェクトへの貢献方法について説明します。

---

## 📋 貢献の種類

### 1. バグ報告
- [Issues](https://github.com/Lab8010/container-file-builder/issues)で新しいIssueを作成
- バグの再現手順を明確に記載
- 期待される動作と実際の動作を説明
- ブラウザの種類とバージョンを記載

### 2. 機能提案
- [Issues](https://github.com/Lab8010/container-file-builder/issues)で提案を作成
- なぜその機能が必要か説明
- 可能であれば、実装案も提示

### 3. ドキュメント改善
- README、コメント、説明文の改善
- 翻訳の追加・修正
- サンプルの追加

### 4. コード貢献
- バグ修正
- 新機能の実装
- パフォーマンス改善
- リファクタリング

---

## 🚀 開発環境のセットアップ

```bash
# 1. フォーク後、クローン
git clone https://github.com/YOUR_USERNAME/container-file-builder.git
cd container-file-builder

# 2. ローカルサーバーを起動
python3 -m http.server 8000

# 3. ブラウザで開く
# http://localhost:8000
```

---

## 📝 Pull Request の手順

### 1. ブランチを作成
```bash
git checkout -b feature/your-feature-name
# または
git checkout -b fix/your-bug-fix
```

### 2. 変更を加える
- 既存のコードスタイルに従う
- コメントは日本語でOK（英語も歓迎）
- 変更は小さく、明確に

### 3. コミット
```bash
git add .
git commit -m "Add: 新機能の説明"
# または
git commit -m "Fix: バグ修正の説明"
```

**コミットメッセージの形式:**
- `Add:` 新機能追加
- `Fix:` バグ修正
- `Update:` 既存機能の更新
- `Refactor:` リファクタリング
- `Docs:` ドキュメント変更
- `Style:` コードスタイルのみの変更

### 4. プッシュ
```bash
git push origin feature/your-feature-name
```

### 5. Pull Request を作成
- GitHubでPull Requestを作成
- 変更内容を明確に説明
- 関連するIssueがあればリンク

---

## 💻 コーディングガイドライン

### JavaScript
- ES6+の構文を使用
- `const`と`let`を使用（`var`は避ける）
- 関数とクラスにはコメントを記載
- グローバル変数は最小限に

### HTML/CSS
- セマンティックHTMLを使用
- アクセシビリティを考慮
- レスポンシブデザインを維持
- Red Hatカラーテーマに準拠

### 多言語対応
- 新しいテキストは日本語と英語の両方を提供
- `i18n`クラスと`data-ja`/`data-en`属性を使用
- `i18n.js`の`t()`関数を活用

### ブロック追加
新しいブロックを追加する場合：

```javascript
// js/blocks.js に追加
NEWBLOCK: {
    type: 'NEWBLOCK',
    category: 'basic', // basic, file, exec, other
    className: 'block-newblock',
    description: '🎯 日本語の説明',
    description_en: '🎯 English description',
    fields: [
        {
            name: 'fieldName',
            label: 'フィールドラベル',
            type: 'text', // text, textarea
            placeholder: 'example',
            required: true,
            help: '詳細なヘルプテキスト'
        }
    ],
    generate: (values) => {
        return `NEWBLOCK ${values.fieldName}`;
    }
}
```

---

## 🧪 テスト

現在、自動テストはありません。手動テストをお願いします：

### テスト項目
1. ブロックの追加・削除
2. ブロックの編集
3. ブロックの並び替え
4. プレビューの正確性
5. ダウンロード機能
6. 言語切り替え
7. サンプルの読み込み
8. 各ブラウザでの動作（Chrome、Firefox、Safari、Edge）

---

## 📦 新しいサンプルの追加

`js/samples.js`にサンプルを追加：

```javascript
mysample: {
    name_ja: 'サンプル名',
    name_en: 'Sample Name',
    description_ja: '日本語の説明',
    description_en: 'English description',
    level: 'beginner', // beginner, intermediate, advanced
    blocks: [
        {
            type: 'FROM',
            value: 'fedora:39'
        },
        // ... 他のブロック
    ]
}
```

そして`index.html`にカードを追加します。

---

## 🌍 翻訳の貢献

新しい言語を追加する場合：

1. `js/i18n.js`に翻訳を追加
2. すべてのUI要素に対応
3. `README.md`にも翻訳を追加（オプション）

---

## ❓ 質問がある場合

- [Issues](https://github.com/Lab8010/container-file-builder/issues)で質問
- 既存のIssueを検索して、同じ質問がないか確認

---

## 📜 ライセンス

貢献したコードはMITライセンスの下で公開されます。
詳細は[LICENSE](LICENSE)を参照してください。

---

## 🙏 ありがとうございます！

あなたの貢献がContainer File Builderをより良いものにします！

Happy Coding! 🎩✨

