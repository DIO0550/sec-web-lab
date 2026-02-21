import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/input-validation";

type ValidationResult = { success: boolean; message?: string; errors?: string[]; user?: Record<string, unknown>; _debug?: { message: string; risks?: string[] } };

function ValidationPanel({ mode, result, isLoading, onRegister }: { mode: "vulnerable" | "secure"; result: ValidationResult | null; isLoading: boolean; onRegister: (data: Record<string, unknown>) => void }) {
  const [username, setUsername] = useState("taro");
  const [email, setEmail] = useState("taro@example.com");
  const [age, setAge] = useState("25");
  const [website, setWebsite] = useState("https://example.com");

  const presets = [
    { label: "通常", username: "taro", email: "taro@example.com", age: "25", website: "https://example.com" },
    { label: "SQLインジェクション", username: "' OR 1=1 --", email: "test", age: "-1", website: "javascript:alert(1)" },
    { label: "XSS", username: "<script>alert(1)</script>", email: "not-an-email", age: "99999", website: "ftp://evil.com" },
  ];

  return (
    <div>
      <div className="mb-1"><label className="text-[13px] block">ユーザー名:</label><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="py-1 px-2 border border-[#ccc] rounded w-full text-sm" /></div>
      <div className="mb-1"><label className="text-[13px] block">メール:</label><input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="py-1 px-2 border border-[#ccc] rounded w-full text-sm" /></div>
      <div className="mb-1"><label className="text-[13px] block">年齢:</label><input type="text" value={age} onChange={(e) => setAge(e.target.value)} className="py-1 px-2 border border-[#ccc] rounded w-20 text-sm" /></div>
      <div className="mb-2"><label className="text-[13px] block">Website:</label><input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} className="py-1 px-2 border border-[#ccc] rounded w-full text-sm" /></div>
      <div className="flex gap-1 flex-wrap mb-2">
        {presets.map((p) => (
          <button key={p.label} onClick={() => { setUsername(p.username); setEmail(p.email); setAge(p.age); setWebsite(p.website); }} className="text-[11px] py-0.5 px-2 cursor-pointer">{p.label}</button>
        ))}
      </div>
      <FetchButton onClick={() => onRegister({ username, email, age: Number(age), website })} disabled={isLoading}>登録</FetchButton>

      {result && (
        <div className={`mt-2 p-3 rounded ${result.success ? "bg-[#e8f5e9] border border-[#4caf50]" : "bg-[#ffebee] border border-[#f44336]"}`}>
          <div className="text-sm font-bold">{result.success ? "登録成功" : "バリデーションエラー"}</div>
          {result.errors && <ul className="text-xs mt-1">{result.errors.map((e, i) => <li key={i} className="text-[#c62828]">{e}</li>)}</ul>}
          {result.user && <pre className="text-xs bg-[#f5f5f5] p-2 rounded mt-2 overflow-auto">{JSON.stringify(result.user, null, 2)}</pre>}
          {result._debug && <div className="mt-2 text-xs text-[#888] italic">{result._debug.message}</div>}
        </div>
      )}
    </div>
  );
}

export function InputValidation() {
  const [vulnResult, setVulnResult] = useState<ValidationResult | null>(null);
  const [secureResult, setSecureResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (mode: "vulnerable" | "secure", data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result: ValidationResult = await res.json();
      if (mode === "vulnerable") setVulnResult(result);
      else setSecureResult(result);
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnResult(err);
      else setSecureResult(err);
    }
    setLoading(false);
  };

  return (
    <LabLayout title="入力バリデーション設計" subtitle="サーバー側での型・形式・範囲の検証" description="クライアント側のバリデーションは迂回可能です。サーバー側ですべての入力を型・形式・範囲で検証することが多層防御の基本です。">
      <ComparisonPanel
        vulnerableContent={<ValidationPanel mode="vulnerable" result={vulnResult} isLoading={loading} onRegister={(d) => handleRegister("vulnerable", d)} />}
        secureContent={<ValidationPanel mode="secure" result={secureResult} isLoading={loading} onRegister={(d) => handleRegister("secure", d)} />}
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
