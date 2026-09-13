# 今日の和茶タイプ診断（ai-wacha-shindan-v3）

祇園茶寮 × タニタカフェ 柏の葉店 向けの、卓上 QR から遊べる「和茶タイプ診断」Web アプリです。
6問・約30秒のタップ式診断で、6つの和茶（抹茶／ほうじ茶／和紅茶／桑茶／枇杷の葉茶／ルイボスティー）
から今日のあなたに近いタイプを見つけ、AI が短い結果文を、ルールベースのロジックがおすすめメニューを添えます。

> 既存リポジトリ（`ai-shindan-ver.2`）を直接参照した、まったく新しいプロジェクトです。
> 「和茶タイプ診断」というコンセプトと基本機能は引き継ぎつつ、配点の偏りの解消・画面構成の整理・
> 商品提案の柔軟化・匿名ログ基盤の追加など、設計から作り直しています。

## 1. サービス概要

- 店舗卓上の QR コードから開き、6問の質問にタップだけで回答（目標30〜45秒）。
- メインタイプ＋隠れタイプを判定し、AI が「短い性格要約・今日のひとこと・和ことば」などを生成。
- 診断結果に応じて、同じタイプでもおすすめメニューが変わる（味覚・気分の回答を反映）。
- 結果はカード画像として保存・LINE/Web Share で共有でき、友達同士の和茶相性も見られる。
- 個人情報は一切保存しない。改善用の匿名イベントログのみ Supabase に記録できる。
- OpenAI が使えない／失敗しても、診断・結果表示は止まらない（フォールバック文を用意）。

## 2. 技術構成

| 領域 | 採用 |
| --- | --- |
| フレームワーク | Next.js 16（App Router）／ React 19 ／ TypeScript 5（strict） |
| スタイル | CSS Modules ＋ `app/globals.css`（トークン・リセット）。UI ライブラリは使わない |
| AI | OpenAI Chat Completions を `fetch` で直接呼び出し（SDK 未使用・依存を増やさない方針） |
| データ保存 | Supabase（匿名イベントログ用）。PostgREST に直接 `fetch` で INSERT（`@supabase/supabase-js` 未使用） |
| テスト | Vitest（`test/**/*.test.ts`、node 環境） |
| その他 dev 依存 | `tsx`（配点分布レポートの実行用） |

ディレクトリ構成:

```
app/            画面・API ルート（App Router）
components/     画面部品（*.tsx + 対の *.module.css）
hooks/          クライアント状態（診断フローの状態機械、reduced-motion）
lib/            純粋ロジック（診断・推薦・AI呼び出し・検証・共有・分析ログ）
data/           差し替え前提のマスタデータ（質問・タイプ・商品・相性・店舗名）
types/          ドメイン型の単一の真実
test/           Vitest テスト
scripts/        配点分布レポート（npm run distribution）
supabase/       匿名ログ用テーブルの SQL
public/menu/    タイプ別のメニュー写真（差し替え可能）
```

依存の向き: `types` ← `data` ← `lib` ← `hooks` / `app/api` ← `components` ← `app/page.tsx`。
`lib/diagnosis.ts` が診断ロジックの単一入口で、クライアント（即時プレビュー用）と
`/api/diagnose`（AI 結果文生成）の両方から呼ばれます。

## 3. ローカル起動方法

Node.js 20.9 以上を推奨。

```bash
npm install
npm run dev
```

表示された `http://localhost:3000` を開きます。`.env.local` が無くても、AI・Supabase は
自動的にオフライン相当の動作（フォールバック文 / ログ送信なし）になるため、そのまま診断を
最後まで試せます。

## 4. 環境変数設定

`.env.example` をコピーして `.env.local` を作成します。

```bash
cp .env.example .env.local
```

| 変数 | 必須 | 説明 |
| --- | --- | --- |
| `OPENAI_API_KEY` | 任意 | 未設定なら結果文は常にフォールバック（決定論的な文章）になります |
| `OPENAI_MODEL` | 任意 | 既定 `gpt-5-mini` |
| `NEXT_PUBLIC_SUPABASE_URL` | 任意 | 未設定なら匿名ログは送信されません（`/api/log` は 204 を返すだけ） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 任意 | ログ INSERT に使う匿名キー |
| `SUPABASE_SERVICE_ROLE_KEY` | 任意 | サーバー専用。設定されていればログ INSERT に優先使用（クライアントには一切渡さない） |

env は import 時ではなく **使用時に読む**設計のため、未設定でも `npm run build` / `npm test` は通ります。

## 5. Supabase設定

匿名イベントログ（後述）を使う場合のみ設定してください。

1. Supabase プロジェクトを作成する。
2. SQL Editor で `supabase/schema.sql` の内容を実行する（`diagnosis_events` テーブルと RLS ポリシーを作成）。
3. `.env.local` に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定する。
4. Vercel にも同じ環境変数を登録する（本番でログを取りたい場合）。

集計用の SQL サンプル（診断開始数・完了率・タイプ別比率・商品タップ数など）は
`supabase/schema.sql` の末尾にコメントで置いています。

## 6. OpenAI設定

1. OpenAI の API キーを発行する。
2. `.env.local` に `OPENAI_API_KEY` を設定する（必要なら `OPENAI_MODEL` も）。
3. Vercel の Environment Variables にも同じ値を登録する。

**キーはサーバー側（`app/api/diagnose/route.ts` から `lib/ai.ts`）でのみ使用し、クライアントに
渡すことはありません。** タイプ判定そのものは AI に行わせず、`lib/diagnosis.ts` の
ルールベースロジックで確定した結果に、AI が短い文章を肉付けするだけです（詳細は §10）。

## 7. Vercelデプロイ方法

1. このリポジトリを GitHub にプッシュする。
2. Vercel で「Import Project」からリポジトリを選択する（Framework は自動検出で Next.js になります）。
3. Vercel の Project Settings → Environment Variables に、§4 の環境変数を設定する。
4. Deploy。以降は `main` への push で自動再デプロイされます。

店舗卓上の QR コードには、公開後の URL（例: `https://xxxx.vercel.app/`）をそのまま埋め込みます。

## 8. 商品変更方法

商品マスタは `data/products.ts` に集約しています。

```ts
"matcha-latte": {
  id: "matcha-latte",
  name: "抹茶ラテ",
  price: 605,           // 税込・整数円（price: null にすると「価格は店舗にてご確認ください」表示になる）
  category: "drink",    // "drink" | "sweet" | "plate"
  image: "/menu/matcha.jpg",
  reason: "…",
  status: "active",     // "inactive" にすると提案・表示から外れる
},
```

- 価格・商品名・画像パス・おすすめ理由・カテゴリはこのオブジェクトを直すだけで反映されます。
- 価格を店舗で掲示しない商品（例: 日替わり内容のコラボプレート）は `price: null` にします。
  UI は「価格は店舗にてご確認ください」と表示し、合計金額の計算からも自動的に除外されます
  （`lib/recommendation.ts` の `hasUnpricedItem`）。
- 販売を止めたい商品は `status: "inactive"` にする（推薦ロジックが自動的に他の組み合わせへ退避します）。
- 「今日のおすすめ」は `productSets`（同ファイル内）で商品を1〜2点組み合わせたもの
  （単品ドリンクのみの組み合わせも可）。新しい組み合わせを増やしたら、`lib/recommendation.ts` の
  `setPlanByType` に、どの「傾向（甘め・軽め・ドリンク中心）」で使うかを追記してください。
- 写真は `public/menu/` に追加し、`data/products.ts` の `image` を差し替えます（`next/image` が自動最適化）。

> 商品名・価格は2026-09に実店舗のメニュー（祇園茶寮側・タニタカフェ側）から書き起こした値です。
> メニュー改定時は写真を見ながら `data/products.ts` を直接更新してください。読み取りが不鮮明だった
> 一部の値（コード内に理由をコメントで明記）は、念のため実際の伝票と突き合わせて確認してください。

## 9. 質問変更方法

質問は `data/questions.ts` に集約しています。6問 × 4択の構造です。

```ts
q("q1a", "静かに、自分のペースで過ごす", "matcha", "biwa"),
//  ID     表示ラベル                    main      sub
```

- `main`（+2点）・`sub`（+1点）は、必ず異なるタイプを指定してください。
- **配点の均等性を壊さないための決まり**: 6問 × 4択 = 24枠の `main` は、
  6タイプ × 4回で均等になるように設計してあります（`sub` も同様）。
  文言だけ変える分には問題ありませんが、`main`/`sub` の組み合わせを変える場合は
  必ず `npm run distribution` で偏りを確認してください（§11）。
- 子ども向けの質問は `data/kids-question.ts`、途中のリアクション文は
  `data/questions.ts` の `interludes` にあります。

## 10. 診断ロジックの説明

単一入口は `lib/diagnosis.ts` の `diagnose(answers)`（`src/lib/kpi` 相当の位置づけ）。

1. 6問の回答から、`choice.main` に +2点、`choice.sub` に +1点を加算（`scoreAnswers`）。
2. 最高得点のタイプを「メインタイプ」、それを除いた中の最高得点を「隠れタイプ」とする。
3. **同点は配列順・オブジェクト順で決めない。** 明示的なタイブレークルールを順に適用する
   （`breakTie`）:
   1. Q1「今日、このあとの時間をどう過ごせたら『いい日』か」の回答の `main`
   2. Q6「お店を出るときどんな気持ちになっていたいか」の回答の `main`
   3. Q1 の回答の `sub`
   4. Q6 の回答の `sub`
   5. それでも決まらない場合のみ、固定の優先順位 `TIEBREAK_PRIORITY`
      （`rooibos > biwa > kuwacha > wakoucha > hojicha > matcha`。総当たりで
      相対的に出にくかった側を前に置いています）
4. どの手順で決まったかは `mainTiebreak` / `hiddenTiebreak` として結果に残る（説明可能性のため）。

タイプ判定そのものに AI は使いません。`/api/diagnose`（`lib/ai.ts`）は、確定した
メイン／隠れタイプと回答内容を OpenAI に渡し、短い結果文（性格要約・隠れタイプの説明・
今日のひとこと・おすすめ理由・和ことば）だけを生成させます。AI 応答は
`lib/ai-schema.ts` で形を検証し、失敗時は `lib/fallback.ts` の決定論的な文章に
自動的に切り替わります（すべてのタイプに用意済み。UI は常に描画されます）。

## 11. 配点分布確認方法

```bash
npm run distribution
```

全 4^6 = 4096 通りの回答パターンを総当たりし、メイン／隠れタイプの出現率を表で出します。
現行版は特定タイプ（特にルイボスティー）が構造的にほぼ出ない配点でしたが、本バージョンでは
6問 × 4択 の `main` 登場回数・`sub` 登場回数をそれぞれ6タイプ × 4回に揃えることで解消しています。

実測値（初期データでの結果。質問データを変えたら必ず再確認してください）:

| タイプ | メイン出現率 |
| --- | --- |
| 抹茶 | 17.3% |
| ほうじ茶 | 17.7% |
| 和紅茶 | 17.6% |
| 桑茶 | 14.9% |
| 枇杷の葉茶 | 17.6% |
| ルイボスティー | 14.9% |

仕様上の許容範囲（5%〜30%）はもちろん、`test/distribution.test.ts` では自主基準として
「9%〜24%に収まること」も回帰テストしています。同点処理のテストは `test/tiebreak.test.ts`。

## 12. 匿名ログについて

- 保存するのは **セッション単位のランダムID**（`sessionStorage`、`crypto.randomUUID()`）と、
  イベント名・タイプ・商品ID・小さな meta のみ。氏名・電話番号・LINE名・メール・GPS などは
  一切扱いません（`lib/analytics.ts` / `app/api/log/route.ts`）。
- 送信はベストエフォート（`sendBeacon` → 不可なら `keepalive fetch`）。失敗しても診断・表示は
  止まりません。Supabase の環境変数が無ければ何もせず 204 を返します。
- 取得イベント: `diagnosis_start` / `question_answered` / `diagnosis_complete` /
  `recommendation_view` / `product_detail_tap` / `staff_show_tap` / `result_detail_expand` /
  `result_save` / `line_share` / `share_other` / `compatibility_start` / `kids_mode_used`。
- テーブル定義・RLS（匿名キーは INSERT のみ）・集計 SQL サンプルは `supabase/schema.sql`。

## 13. 相性診断の仕組み

- 結果画面のメイン導線には置かず、「もっと楽しむ」の中の一機能として提供します（LINE/共有と併記）。
- 共有 URL は `?from=<自分のメインタイプ>&h=<隠れタイプ>` のみを付与し、個人情報は含みません
  （`lib/share.ts`）。
- 友達がそのリンクを開いて診断すると、`?from` の値と自分の診断結果（メインタイプ）を
  `data/compatibility.ts` の相性テーブルに掛け合わせ、相性スコア・コメントを表示します
  （`components/CompatibilityPanel.tsx`）。診断履歴やユーザーIDの保存は行いません。

## テスト・ビルドコマンド

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint（next/core-web-vitals + next/typescript）
npm test            # vitest run
npm run build        # 本番ビルド（型チェック込み）
npm run distribution # 配点分布レポート
```

## 注意

- 商品名・価格は実店舗メニューから書き起こし済みですが、ガトーショコラの税込価格など一部
  読み取りが不鮮明だった値があります（該当箇所はコードにコメントで明記）。公開前に実際の
  伝票と突き合わせてください。タニタコラボプレートは店舗判断で価格非掲載（`price: null`）にしています。
- 診断は娯楽目的です。医療・健康状態を断定する内容には使用しないでください。
- ブランドロゴは画像を用意していないため、テキスト表記のみです（`data/store.ts` の `logoSrc`
  にパスを設定すると画像表記に切り替わります）。
