import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Input } from '@site/src/components/lab-ui/Input';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import styles from './InputValidationLab.module.css';

const BASE = '/api/labs/input-validation';

type ValidationResult = {
  success: boolean;
  message?: string;
  errors?: string[];
  user?: Record<string, unknown>;
  _debug?: { message: string; risks?: string[] };
};

const presets = [
  {
    label: '通常',
    username: 'taro',
    email: 'taro@example.com',
    age: '25',
    website: 'https://example.com',
  },
  {
    label: 'SQLインジェクション',
    username: "' OR 1=1 --",
    email: 'test',
    age: '-1',
    website: 'javascript:alert(1)',
  },
  {
    label: 'XSS',
    username: '<script>alert(1)</script>',
    email: 'not-an-email',
    age: '99999',
    website: 'ftp://evil.com',
  },
];

function ValidationPanel({
  mode,
  result,
  isLoading,
  onRegister,
}: {
  mode: 'vulnerable' | 'secure';
  result: ValidationResult | null;
  isLoading: boolean;
  onRegister: (data: Record<string, unknown>) => void;
}) {
  const [username, setUsername] = useState('taro');
  const [email, setEmail] = useState('taro@example.com');
  const [age, setAge] = useState('25');
  const [website, setWebsite] = useState('https://example.com');

  return (
    <div>
      <Input
        label="ユーザー名:"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className={styles.inputField}
      />
      <Input
        label="メール:"
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={styles.inputField}
      />
      <Input
        label="年齢:"
        type="text"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        className={styles.inputField}
      />
      <Input
        label="Website:"
        type="text"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className={styles.presetRow}
      />
      <PresetButtons
        presets={presets}
        onSelect={(p) => {
          setUsername(p.username);
          setEmail(p.email);
          setAge(p.age);
          setWebsite(p.website);
        }}
        className={styles.presetRow}
      />
      <FetchButton
        onClick={() =>
          onRegister({ username, email, age: Number(age), website })
        }
        disabled={isLoading}
      >
        登録
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <Alert
          variant={result?.success ? 'success' : 'error'}
          title={result?.success ? '登録成功' : 'バリデーションエラー'}
          className={styles.resultAlert}
        >
          {result?.errors && (
            <ul className={styles.errorList}>
              {result.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
          {result?.user && (
            <pre className={styles.dataBlock}>
              {JSON.stringify(result.user, null, 2)}
            </pre>
          )}
          {result?._debug && (
            <div className={styles.debugText}>{result._debug.message}</div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

/**
 * 入力バリデーション設計ラボUI
 *
 * サーバー側バリデーションの有無による違いを体験する。
 */
export function InputValidationLab() {
  const [vulnerable, setVulnerable] = useState<ValidationResult | null>(null);
  const [secure, setSecure] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (
    mode: 'vulnerable' | 'secure',
    data: Record<string, unknown>,
  ) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result: ValidationResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnerable(result);
      } else {
        setSecure(result);
      }
    } catch (e) {
      const errResult: ValidationResult = {
        success: false,
        message: (e as Error).message,
      };
      if (mode === 'vulnerable') {
        setVulnerable(errResult);
      } else {
        setSecure(errResult);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <h3>Lab: 入力バリデーション設計</h3>
      <p className={styles.description}>
        脆弱版ではSQLインジェクションやXSSペイロードが受け付けられます。
        安全版では不正な入力に対して具体的なバリデーションエラーが返されます。
      </p>

      <ComparisonPanel
        vulnerableContent={
          <ValidationPanel
            mode="vulnerable"
            result={vulnerable}
            isLoading={loading}
            onRegister={(d) => handleRegister('vulnerable', d)}
          />
        }
        secureContent={
          <ValidationPanel
            mode="secure"
            result={secure}
            isLoading={loading}
            onRegister={(d) => handleRegister('secure', d)}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>
            脆弱版: SQLインジェクションやXSSペイロードが受け付けられるか
          </li>
          <li>
            安全版:
            不正な入力に対して具体的なバリデーションエラーが返されるか
          </li>
          <li>サーバー側バリデーションが必須である理由を理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
