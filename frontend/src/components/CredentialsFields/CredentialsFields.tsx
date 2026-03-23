import { Input } from "@/components/Input";

type Props = {
  /** ユーザー名の現在値 */
  username: string;
  /** パスワードの現在値 */
  password: string;
  /** ユーザー名が変更されたときのコールバック */
  onUsernameChange: (value: string) => void;
  /** パスワードが変更されたときのコールバック */
  onPasswordChange: (value: string) => void;
  /** ユーザー名フィールドのラベル（デフォルト: "ユーザー名"） */
  usernameLabel?: string;
  /** パスワードフィールドのラベル（デフォルト: "パスワード"） */
  passwordLabel?: string;
  /** 入力を無効にするかどうか */
  disabled?: boolean;
};

/**
 * ユーザー名・パスワードの入力フィールドペア
 *
 * ログインフォームで繰り返し使われる username / password の
 * Input ペアを共通化したコンポーネント。
 */
export function CredentialsFields({
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  usernameLabel = "ユーザー名",
  passwordLabel = "パスワード",
  disabled,
}: Props) {
  return (
    <>
      <Input
        label={usernameLabel}
        type="text"
        value={username}
        onChange={(e) => onUsernameChange(e.target.value)}
        className="mb-1"
        disabled={disabled}
      />
      <Input
        label={passwordLabel}
        type="text"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        className="mb-1"
        disabled={disabled}
      />
    </>
  );
}
