import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { Input } from '@site/src/components/lab-ui/Input';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { postJson } from '@site/src/hooks/useLabFetch';
import styles from './HppLab.module.css';

const BASE = '/api/labs/hpp';

type RegisterResult = {
  success: boolean;
  message: string;
  user?: { username: string; role: string };
  _debug?: {
    validatedRole?: string;
    effectiveRole?: string;
    allRolesInQuery?: string[];
    warning?: string;
    detectedQueryRoles?: string[];
    info?: string;
  };
};

type UsersResult = {
  success: boolean;
  users: { username: string; role: string; registeredAt: string }[];
  count: number;
};

/** HPPフォーム（脆弱/安全の各タブ内で使用） */
function HppForm({
  mode,
  registerResult,
  usersResult,
  error,
  isLoading,
  onRegister,
  onFetchUsers,
}: {
  mode: 'vulnerable' | 'secure';
  registerResult: RegisterResult | null;
  usersResult: UsersResult | null;
  error: string | null;
  isLoading: boolean;
  onRegister: (mode: 'vulnerable' | 'secure', username: string, role: string, addDuplicate: boolean) => void;
  onFetchUsers: (mode: 'vulnerable' | 'secure') => void;
}) {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('user');
  const [addDuplicate, setAddDuplicate] = useState(false);

  return (
    <div>
      <div className={styles.inputGroup}>
        <Input
          label="ユーザー名:"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="alice"
        />
      </div>

      <div className={styles.inputGroup}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
          ロール:
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid var(--lab-border)',
            backgroundColor: 'var(--lab-bg-primary)',
            color: 'var(--lab-text-primary)',
          }}
        >
          <option value="user">user</option>
          <option value="editor">editor</option>
        </select>
      </div>

      <div className={styles.inputGroup}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={addDuplicate}
            onChange={(e) => setAddDuplicate(e.target.checked)}
          />
          重複パラメータ追加（role=admin）
        </label>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <FetchButton
          onClick={() => onRegister(mode, username, role, addDuplicate)}
          disabled={isLoading}
        >
          登録
        </FetchButton>
        <FetchButton onClick={() => onFetchUsers(mode)} disabled={isLoading}>
          ユーザー一覧
        </FetchButton>
      </div>

      {error && (
        <div className={styles.resultAlert}>
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <ExpandableSection isOpen={!!registerResult}>
        <div className={styles.resultAlert}>
          <Alert variant={registerResult?.success ? 'success' : 'error'}>
            {registerResult?.message}
          </Alert>
          {registerResult?._debug && (
            <pre className={styles.codeBlock}>
              {JSON.stringify(registerResult._debug, null, 2)}
            </pre>
          )}
        </div>
      </ExpandableSection>

      <ExpandableSection isOpen={!!usersResult}>
        <div className={styles.resultAlert}>
          <Alert variant="info">ユーザー一覧 ({usersResult?.count ?? 0}件):</Alert>
          <pre className={styles.codeBlock}>
            {JSON.stringify(usersResult?.users, null, 2)}
          </pre>
        </div>
      </ExpandableSection>
    </div>
  );
}

/**
 * HTTP Parameter Pollution (HPP) ラボUI
 *
 * 重複パラメータを使ってバリデーションをバイパスし、
 * 権限昇格を体験する。
 */
export function HppLab() {
  const [vulnRegister, setVulnRegister] = useState<RegisterResult | null>(null);
  const [secureRegister, setSecureRegister] = useState<RegisterResult | null>(null);
  const [vulnUsers, setVulnUsers] = useState<UsersResult | null>(null);
  const [secureUsers, setSecureUsers] = useState<UsersResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (
    mode: 'vulnerable' | 'secure',
    username: string,
    role: string,
    addDuplicate: boolean,
  ) => {
    setLoading(true);
    setError(null);
    try {
      // 重複パラメータを追加する場合、クエリパラメータに role=user&role=admin を付与
      const queryString = addDuplicate
        ? `?role=${encodeURIComponent(role)}&role=admin`
        : '';
      const url = `${BASE}/${mode}/register${queryString}`;
      const { body } = await postJson<RegisterResult>(url, { username, role });
      if (mode === 'vulnerable') {
        setVulnRegister(body);
      } else {
        setSecureRegister(body);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
    setLoading(false);
  };

  const handleFetchUsers = async (mode: 'vulnerable' | 'secure') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}/${mode}/users`);
      const data: UsersResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnUsers(data);
      } else {
        setSecureUsers(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
    setLoading(false);
  };

  return (
    <>
      <h3>ユーザー登録（ロール指定）</h3>
      <p className={styles.description}>
        「重複パラメータ追加（role=admin）」にチェックを入れて登録すると、
        クエリパラメータに <code>?role=user&role=admin</code> が付与されます。
        脆弱版ではバリデーションをバイパスしてadmin権限で登録されることを確認してください。
      </p>

      <ComparisonPanel
        vulnerableContent={
          <HppForm
            mode="vulnerable"
            registerResult={vulnRegister}
            usersResult={vulnUsers}
            error={error}
            isLoading={loading}
            onRegister={handleRegister}
            onFetchUsers={handleFetchUsers}
          />
        }
        secureContent={
          <HppForm
            mode="secure"
            registerResult={secureRegister}
            usersResult={secureUsers}
            error={error}
            isLoading={loading}
            onRegister={handleRegister}
            onFetchUsers={handleFetchUsers}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>
            脆弱版: 重複roleパラメータ（<code>?role=user&role=admin</code>）で admin として登録されるか
          </li>
          <li>
            安全版: 重複パラメータが検出されてリクエストが拒否されるか
          </li>
          <li>
            ユーザー一覧で、脆弱版で登録されたユーザーのロールが admin になっていることを確認したか
          </li>
          <li>
            バリデーション層と実行層で異なるパーサーを使うことの危険性を理解したか
          </li>
        </ul>
      </CheckpointBox>
    </>
  );
}
