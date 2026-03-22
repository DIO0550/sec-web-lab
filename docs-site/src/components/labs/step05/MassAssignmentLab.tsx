import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Button } from '@site/src/components/lab-ui/Button';
import { Input } from '@site/src/components/lab-ui/Input';
import { Alert } from '@site/src/components/lab-ui/Alert';
import styles from './MassAssignmentLab.module.css';

const BASE = '/api/labs/mass-assignment';

type RegisterResult = {
  success: boolean;
  message: string;
  user?: { id: number; username: string; email: string; role: string };
  _debug?: { message: string; receivedFields?: string[]; roleSource?: string; ignoredFields?: string[] };
};

type UsersResult = {
  users: Array<{ id: number; username: string; email: string; role: string }>;
};

// --- 登録フォーム ---
function RegisterForm({
  mode,
  result,
  isLoading,
  onRegister,
}: {
  mode: 'vulnerable' | 'secure';
  result: RegisterResult | null;
  isLoading: boolean;
  onRegister: (mode: 'vulnerable' | 'secure', data: Record<string, string>) => void;
}) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('pass123');
  const [addRole, setAddRole] = useState(false);

  return (
    <div>
      <Input
        label="ユーザー名:"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="hacker"
        className={styles.inputGroup}
      />
      <Input
        label="メール:"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="hacker@evil.com"
        className={styles.inputGroup}
      />
      <Input
        label="パスワード:"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={styles.inputGroup}
      />
      <div className={styles.checkboxRow}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={addRole}
            onChange={(e) => setAddRole(e.target.checked)}
          />
          <span className={styles.attackText}>
            リクエストに <code>"role": "admin"</code> を追加する（Mass Assignment 攻撃）
          </span>
        </label>
      </div>
      <FetchButton
        onClick={() => {
          const data: Record<string, string> = { username, email, password };
          if (addRole) {
            data.role = 'admin';
          }
          onRegister(mode, data);
        }}
        disabled={isLoading}
      >
        ユーザー登録
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <Alert
          variant={result?.success ? 'success' : 'error'}
          title={result?.success ? '登録成功' : '登録失敗'}
          className={styles.resultAlert}
        >
          <div className={styles.smallText}>{result?.message}</div>
          {result?.user && (
            <div>
              <pre className={styles.codeBlock}>
                {JSON.stringify(result.user, null, 2)}
              </pre>
              <div
                className={`${styles.roleDisplay} ${result.user.role === 'admin' ? styles.roleAdmin : styles.roleUser}`}
              >
                role: {result.user.role}
                {result.user.role === 'admin' && ' -- 管理者権限を取得!'}
              </div>
            </div>
          )}
          {result?._debug && (
            <div className={styles.debugInfo}>
              <div>{result._debug.message}</div>
              {result._debug.receivedFields && (
                <div>受信フィールド: {result._debug.receivedFields.join(', ')}</div>
              )}
              {result._debug.roleSource && <div>role の出所: {result._debug.roleSource}</div>}
              {result._debug.ignoredFields && (
                <div>無視されたフィールド: {result._debug.ignoredFields.join(', ')}</div>
              )}
            </div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

// --- メインコンポーネント ---
export function MassAssignmentLab() {
  // register state
  const [vulnRegisterResult, setVulnRegisterResult] = useState<RegisterResult | null>(null);
  const [secureRegisterResult, setSecureRegisterResult] = useState<RegisterResult | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);

  // users state
  const [users, setUsers] = useState<UsersResult | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);

  const handleRegister = async (mode: 'vulnerable' | 'secure', data: Record<string, string>) => {
    setRegisterLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result: RegisterResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnRegisterResult(result);
      } else {
        setSecureRegisterResult(result);
      }
    } catch (e) {
      const errResult: RegisterResult = {
        success: false,
        message: e instanceof Error ? e.message : String(e),
      };
      if (mode === 'vulnerable') {
        setVulnRegisterResult(errResult);
      } else {
        setSecureRegisterResult(errResult);
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch(`${BASE}/users`);
      const data: UsersResult = await res.json();
      setUsers(data);
    } catch {
      // ignore
    }
    setUsersLoading(false);
  };

  const resetData = async () => {
    try {
      await fetch(`${BASE}/reset`, { method: 'POST' });
      setVulnRegisterResult(null);
      setSecureRegisterResult(null);
      setUsers(null);
    } catch {
      // ignore
    }
  };

  return (
    <>
      <h3 className={styles.sectionTitle}>Step 1: ユーザー登録（Mass Assignment 攻撃）</h3>
      <p className={styles.description}>
        ユーザー名とメールを入力し、<strong className={styles.attackText}>「role: admin を追加する」チェックボックス</strong>をONにして登録してみてください。
        脆弱版では管理者として登録され、安全版では role フィールドが無視されます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <RegisterForm
            mode="vulnerable"
            result={vulnRegisterResult}
            isLoading={registerLoading}
            onRegister={handleRegister}
          />
        }
        secureContent={
          <RegisterForm
            mode="secure"
            result={secureRegisterResult}
            isLoading={registerLoading}
            onRegister={handleRegister}
          />
        }
      />

      <h3 className={styles.sectionTitle}>Step 2: 登録済みユーザーの確認</h3>
      <p className={styles.description}>
        登録されたユーザーの一覧を確認し、role が正しく設定されているか比較してください。
      </p>
      <div className={styles.buttonRow}>
        <FetchButton onClick={fetchUsers} disabled={usersLoading}>
          ユーザー一覧を表示
        </FetchButton>
        <Button variant="secondary" size="sm" onClick={resetData}>
          デモデータをリセット
        </Button>
      </div>
      <ExpandableSection isOpen={!!users}>
        <table className={styles.userTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>username</th>
              <th>email</th>
              <th>role</th>
            </tr>
          </thead>
          <tbody>
            {users?.users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td className={u.role === 'admin' ? styles.adminRole : undefined}>
                  {u.role}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ExpandableSection>

      <CheckpointBox>
        <ul>
          <li>脆弱版: <code>"role": "admin"</code> を追加して管理者として登録できるか</li>
          <li>安全版: 同じ攻撃を行っても role が <code>"user"</code> のままか</li>
          <li>フロントエンドのフォームにないフィールドでもAPIに送信できる理由を理解したか</li>
          <li>ホワイトリスト方式がなぜこの攻撃を防げるか説明できるか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
