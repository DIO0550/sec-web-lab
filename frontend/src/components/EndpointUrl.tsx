import type { ReactNode } from "react";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type Props = {
  /** HTTPメソッド（デフォルト: GET） */
  method?: HttpMethod;
  /** URL パスを children として渡す */
  children: ReactNode;
  /** 右端に配置するアクション要素（FetchButton 等） */
  action?: ReactNode;
  className?: string;
};

/** メソッドごとのバッジ色 */
const METHOD_STYLES: Record<HttpMethod, string> = {
  GET: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  POST: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  PUT: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  DELETE: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  PATCH: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

/**
 * HTTPエンドポイントURL表示コンポーネント
 *
 * HTTPメソッドをカラーバッジで表示し、URLパスをモノスペースで表示する。
 * action を渡すとURLの右端にボタン等を配置でき、1つのバーにまとまる。
 */
export function EndpointUrl({ method = "GET", children, action, className = "" }: Props) {
  return (
    <div
      className={`flex items-center gap-3 bg-bg-secondary rounded-lg px-3 py-2 ${className}`}
    >
      <span className="inline-flex items-center gap-2 font-mono text-sm min-w-0">
        <span
          className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded ${METHOD_STYLES[method]}`}
        >
          {method}
        </span>
        <span className="text-text-primary break-all">{children}</span>
      </span>
      {action && <span className="shrink-0 ml-auto">{action}</span>}
    </div>
  );
}
