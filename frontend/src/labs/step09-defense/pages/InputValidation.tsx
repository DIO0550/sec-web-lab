import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { ExpandableSection } from "../../../components/ExpandableSection";
import { Input } from "@/components/Input";
import { Alert } from "@/components/Alert";
import { PresetButtons } from "@/components/PresetButtons";
import { useComparisonFetch } from "../../../hooks/useComparisonFetch";

const BASE = "/api/labs/input-validation";

type ValidationResult = { success: boolean; message?: string; errors?: string[]; user?: Record<string, unknown>; _debug?: { message: string; risks?: string[] } };

const presets = [
  { label: "通常", username: "taro", email: "taro@example.com", age: "25", website: "https://example.com" },
  { label: "SQLインジェクション", username: "' OR 1=1 --", email: "test", age: "-1", website: "javascript:alert(1)" },
  { label: "XSS", username: "<script>alert(1)</script>", email: "not-an-email", age: "99999", website: "ftp://evil.com" },
];

function ValidationPanel({ mode, result, isLoading, onRegister }: { mode: "vulnerable" | "secure"; result: ValidationResult | null; isLoading: boolean; onRegister: (data: Record<string, unknown>) => void }) {
  const [username, setUsername] = useState("taro");
  const [email, setEmail] = useState("taro@example.com");
  const [age, setAge] = useState("25");
  const [website, setWebsite] = useState("https://example.com");

  return (
    <div>
      <Input label="ユーザー名:" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="mb-1" />
      <Input label="メール:" type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="mb-1" />
      <Input label="年齢:" type="text" value={age} onChange={(e) => setAge(e.target.value)} className="mb-1" />
      <Input label="Website:" type="text" value={website} onChange={(e) => setWebsite(e.target.value)} className="mb-2" />
      <PresetButtons
        presets={presets}
        onSelect={(p) => { setUsername(p.username); setEmail(p.email); setAge(p.age); setWebsite(p.website); }}
        className="mb-2"
      />
      <FetchButton onClick={() => onRegister({ username, email, age: Number(age), website })} disabled={isLoading}>登録</FetchButton>

      <ExpandableSection isOpen={!!result}>
        <Alert variant={result?.success ? "success" : "error"} title={result?.success ? "登録成功" : "バリデーションエラー"} className="mt-2">
          {result?.errors && <ul className="text-xs mt-1">{result.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>}
          {result?.user && <pre className="text-xs bg-bg-secondary p-2 rounded mt-2 overflow-auto">{JSON.stringify(result.user, null, 2)}</pre>}
          {result?._debug && <div className="mt-2 text-xs text-text-muted italic">{result._debug.message}</div>}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

export function InputValidation() {
  const validation = useComparisonFetch<ValidationResult>(BASE);

  const handleRegister = async (mode: "vulnerable" | "secure", data: Record<string, unknown>) => {
    await validation.postJson(mode, "/register", data, (e) => ({
      success: false,
      message: e.message,
    }));
  };

  return (
    <LabLayout title="入力バリデーション設計" subtitle="サーバー側での型・形式・範囲の検証" description="クライアント側のバリデーションは迂回可能です。サーバー側ですべての入力を型・形式・範囲で検証することが多層防御の基本です。">
      <ComparisonPanel
        vulnerableContent={<ValidationPanel mode="vulnerable" result={validation.vulnerable} isLoading={validation.loading} onRegister={(d) => handleRegister("vulnerable", d)} />}
        secureContent={<ValidationPanel mode="secure" result={validation.secure} isLoading={validation.loading} onRegister={(d) => handleRegister("secure", d)} />}
      />
      <CheckpointBox>
        <ul>
          <li>脆弱版: SQLインジェクションやXSSペイロードが受け付けられるか</li>
          <li>安全版: 不正な入力に対して具体的なバリデーションエラーが返されるか</li>
          <li>サーバー側バリデーションが必須である理由を理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
