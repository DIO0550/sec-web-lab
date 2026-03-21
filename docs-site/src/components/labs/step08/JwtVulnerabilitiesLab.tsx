import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Button } from '@site/src/components/lab-ui/Button';
import { Input } from '@site/src/components/lab-ui/Input';
import { Textarea } from '@site/src/components/lab-ui/Textarea';
import { Alert } from '@site/src/components/lab-ui/Alert';
import styles from './JwtVulnerabilitiesLab.module.css';

const BASE = '/api/labs/jwt-vulnerabilities';

type JwtResult = {
  success: boolean;
  message: string;
  token?: string;
  profile?: Record<string, unknown>;
  _debug?: { message: string; algorithm?: string };
};

function JwtPanel({
  mode,
  loginResult,
  profileResult,
  isLoading,
  onLogin,
  onProfile,
  onAlgNone,
}: {
  mode: 'vulnerable' | 'secure';
  loginResult: JwtResult | null;
  profileResult: JwtResult | null;
  isLoading: boolean;
  onLogin: (u: string, p: string) => void;
  onProfile: (token: string) => void;
  onAlgNone: () => void;
}) {
  const [token, setToken] = useState('');

  return (
    <div>
      <div className={styles.section}>
        <FetchButton onClick={() => onLogin('user1', 'password1')} disabled={isLoading}>
          user1 でログイン
        </FetchButton>
        {loginResult?.token && (
          <div className={styles.tokenBlock}>
            <Input
              label="取得トークン:"
              type="text"
              value={loginResult.token}
              readOnly
              onClick={() => setToken(loginResult.token || '')}
            />
            <Button variant="ghost" size="sm" onClick={() => setToken(loginResult.token || '')}>
              トークンをコピー
            </Button>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <Textarea
          label="トークン（改ざん可能）:"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          mono
          rows={3}
        />
        <div className={styles.buttonRow}>
          <FetchButton onClick={() => onProfile(token)} disabled={isLoading}>
            プロフィール取得
          </FetchButton>
          {mode === 'vulnerable' && (
            <FetchButton onClick={onAlgNone} disabled={isLoading}>
              alg=none 攻撃
            </FetchButton>
          )}
        </div>
      </div>

      <ExpandableSection isOpen={!!profileResult}>
        <Alert variant={profileResult?.success ? 'success' : 'error'} title={profileResult?.success ? '認証成功' : '認証失敗'} className={styles.resultAlert}>
          <div className={styles.smallText}>{profileResult?.message}</div>
          {profileResult?.profile && (
            <pre className={styles.codeBlock}>
              {JSON.stringify(profileResult.profile, null, 2)}
            </pre>
          )}
          {profileResult?._debug && <div className={styles.debugText}>{profileResult._debug.message}</div>}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

/**
 * JWT脆弱性 ラボUI
 *
 * JWTのalg=none攻撃による認証バイパスを体験する。
 */
export function JwtVulnerabilitiesLab() {
  const [vulnLogin, setVulnLogin] = useState<JwtResult | null>(null);
  const [secureLogin, setSecureLogin] = useState<JwtResult | null>(null);
  const [vulnProfile, setVulnProfile] = useState<JwtResult | null>(null);
  const [secureProfile, setSecureProfile] = useState<JwtResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (mode: 'vulnerable' | 'secure', username: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data: JwtResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnLogin(data);
      } else {
        setSecureLogin(data);
      }
    } catch (e) {
      const errResult: JwtResult = { success: false, message: (e as Error).message };
      if (mode === 'vulnerable') {
        setVulnLogin(errResult);
      } else {
        setSecureLogin(errResult);
      }
    }
    setLoading(false);
  };

  const handleProfile = async (mode: 'vulnerable' | 'secure', token: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: JwtResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnProfile(data);
      } else {
        setSecureProfile(data);
      }
    } catch (e) {
      const errResult: JwtResult = { success: false, message: (e as Error).message };
      if (mode === 'vulnerable') {
        setVulnProfile(errResult);
      } else {
        setSecureProfile(errResult);
      }
    }
    setLoading(false);
  };

  const handleAlgNone = async () => {
    // alg=none でadminになりすまし
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const payload = btoa(JSON.stringify({ sub: 'admin', role: 'admin' })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const fakeToken = `${header}.${payload}.`;
    await handleProfile('vulnerable', fakeToken);
  };

  return (
    <>
      <ComparisonPanel
        vulnerableContent={
          <JwtPanel mode="vulnerable" loginResult={vulnLogin} profileResult={vulnProfile} isLoading={loading}
            onLogin={(u, p) => handleLogin('vulnerable', u, p)} onProfile={(t) => handleProfile('vulnerable', t)} onAlgNone={handleAlgNone} />
        }
        secureContent={
          <JwtPanel mode="secure" loginResult={secureLogin} profileResult={secureProfile} isLoading={loading}
            onLogin={(u, p) => handleLogin('secure', u, p)} onProfile={(t) => handleProfile('secure', t)} onAlgNone={() => {}} />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: alg=none でadminになりすませるか</li>
          <li>安全版: alg=none トークンが拒否されるか</li>
          <li>JWTのアルゴリズム固定と署名検証の重要性を理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
