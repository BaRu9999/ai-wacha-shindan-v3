/**
 * サービス全体で共有するドメイン型。
 * ここは依存の根。他モジュールを import しない。
 */

/** 和茶タイプのキー。並び順はタイブレークの決定順にも使う。 */
export type TeaKey =
  | "matcha" // 抹茶
  | "hojicha" // ほうじ茶
  | "wakoucha" // 和紅茶
  | "kuwacha" // 桑茶
  | "biwa" // 枇杷の葉茶
  | "rooibos"; // ルイボスティー

/** 型の定義順（配列やオブジェクトの列挙順に依存しないための単一の真実）。 */
export const TEA_KEYS = [
  "matcha",
  "hojicha",
  "wakoucha",
  "kuwacha",
  "biwa",
  "rooibos",
] as const satisfies readonly TeaKey[];

export type Scores = Record<TeaKey, number>;

/** 質問の4要素。診断の設問はこの4要素が自然に混ざるよう設計する。 */
export type QuestionTheme = "mood" | "personality" | "taste" | "spend";

export type Choice = {
  /** 安定 ID（例: "q1a"）。ログ・共有・推薦ルールで参照する。 */
  id: string;
  label: string;
  /** 選択肢の下に小さく添える補足（任意）。 */
  hint?: string;
  /** メイン配点先（+2点）。 */
  main: TeaKey;
  /** サブ配点先（+1点）。main とは必ず異なる。 */
  sub: TeaKey;
};

export type Question = {
  /** "q1"〜"q6"。 */
  id: string;
  title: string;
  theme: QuestionTheme;
  choices: [Choice, Choice, Choice, Choice];
};

/** 1問分の回答（保存する情報は最小限）。 */
export type Answer = {
  questionId: string;
  choiceId: string;
};

/** 子ども向け「最後の一問」の回答 ID。 */
export type KidsChoiceId = "sweet" | "calm" | "special";

/** どのタイブレークルールで最終決定したか（説明可能性のため保持）。 */
export type TiebreakReason =
  | null
  | "no-tie"
  | "q1-main"
  | "q6-main"
  | "q1-sub"
  | "q6-sub"
  | "priority-order";

export type DiagnosisResult = {
  main: TeaKey;
  hidden: TeaKey;
  scores: Scores;
  /** 得点の高い順。 */
  ranking: TeaKey[];
  mainTiebreak: TiebreakReason;
  hiddenTiebreak: TiebreakReason;
};

/** AI（またはフォールバック）が生成する結果文。 */
export type DiagnosisText = {
  /** 短い性格要約。 */
  summary: string;
  /** 隠れタイプの説明。 */
  hiddenInsight: string;
  /** 今日のひとこと。 */
  today: string;
  /** おすすめ理由。 */
  recommendationReason: string;
  /** 和ことば（四字熟語など）。 */
  word: string;
  /** 和ことばの意味。 */
  wordMeaning: string;
};

export const DIAGNOSIS_TEXT_KEYS = [
  "summary",
  "hiddenInsight",
  "today",
  "recommendationReason",
  "word",
  "wordMeaning",
] as const satisfies readonly (keyof DiagnosisText)[];

/** 結果文の生成元。UI では出し分けに使わないが、ログ・デバッグ用に返す。 */
export type DiagnosisTextSource = "ai" | "fallback";
