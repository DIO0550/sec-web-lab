import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Input } from '@site/src/components/lab-ui/Input';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import styles from './BusinessLogicLab.module.css';

const BASE = '/api/labs/business-logic';

type OrderResult = {
  success: boolean;
  message: string;
  order?: { product: string; quantity: number; unitPrice: number; total: number; balance: number };
  _debug?: { message: string; risks?: string[] };
};

const presets = [
  { label: '通常購入', productId: '2', quantity: '1', price: '' },
  { label: '負の数量', productId: '2', quantity: '-5', price: '' },
  { label: '価格改ざん', productId: '1', quantity: '1', price: '0' },
];

function OrderPanel({
  mode,
  results,
  isLoading,
  onOrder,
}: {
  mode: 'vulnerable' | 'secure';
  results: OrderResult[];
  isLoading: boolean;
  onOrder: (productId: string, quantity: number, price?: number) => void;
}) {
  const [productId, setProductId] = useState('1');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');

  return (
    <div>
      <div className={styles.mb2}>
        <label className={styles.selectLabel}>商品ID:</label>
        <select
          className={styles.select}
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        >
          <option value="1">ノートPC (¥150,000)</option>
          <option value="2">マウス (¥3,000)</option>
          <option value="3">キーボード (¥8,000)</option>
        </select>
      </div>
      <Input
        type="number"
        label="数量:"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className={styles.mb2}
      />
      {mode === 'vulnerable' && (
        <Input
          type="number"
          label="価格（改ざん用）:"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="空=サーバー価格"
          className={styles.mb2}
        />
      )}
      <PresetButtons
        presets={presets}
        onSelect={(p) => {
          setProductId(p.productId);
          setQuantity(p.quantity);
          setPrice(p.price);
        }}
        className={styles.mb2}
      />
      <FetchButton
        onClick={() =>
          onOrder(productId, Number(quantity), price ? Number(price) : undefined)
        }
        disabled={isLoading}
      >
        注文実行
      </FetchButton>

      <ExpandableSection isOpen={results.length > 0}>
        <div className={styles.resultScroll}>
          {results.map((r, i) => (
            <Alert
              key={i}
              variant={r.success ? 'success' : 'error'}
              className={styles.resultAlert}
            >
              <div>{r.message}</div>
              {r.order && (
                <div className={styles.mono}>
                  残高: ¥{r.order.balance.toLocaleString()} (合計: ¥
                  {r.order.total.toLocaleString()})
                </div>
              )}
              {r._debug && (
                <div className={styles.italic}>{r._debug.message}</div>
              )}
            </Alert>
          ))}
        </div>
      </ExpandableSection>
    </div>
  );
}

/**
 * ビジネスロジックの欠陥ラボUI
 *
 * 数量や価格の不正操作で意図しない取引が成立する脆弱性を体験する。
 */
export function BusinessLogicLab() {
  const [vulnResults, setVulnResults] = useState<OrderResult[]>([]);
  const [secureResults, setSecureResults] = useState<OrderResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleOrder = async (
    mode: 'vulnerable' | 'secure',
    productId: string,
    quantity: number,
    price?: number,
  ) => {
    setLoading(true);
    try {
      const payload: Record<string, unknown> = { productId, quantity };
      if (price !== undefined && mode === 'vulnerable') {
        payload.price = price;
      }
      const res = await fetch(`${BASE}/${mode}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data: OrderResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnResults((prev) => [...prev, data]);
      } else {
        setSecureResults((prev) => [...prev, data]);
      }
    } catch (e) {
      const err: OrderResult = {
        success: false,
        message: (e as Error).message,
      };
      if (mode === 'vulnerable') {
        setVulnResults((prev) => [...prev, err]);
      } else {
        setSecureResults((prev) => [...prev, err]);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <ComparisonPanel
        vulnerableContent={
          <OrderPanel
            mode="vulnerable"
            results={vulnResults}
            isLoading={loading}
            onOrder={(p, q, pr) => handleOrder('vulnerable', p, q, pr)}
          />
        }
        secureContent={
          <OrderPanel
            mode="secure"
            results={secureResults}
            isLoading={loading}
            onOrder={(p, q) => handleOrder('secure', p, q)}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: 数量 -5 で残高が増えるか（マイナス掛け算）</li>
          <li>脆弱版: 価格 0 で無料購入できるか</li>
          <li>安全版: サーバー側で価格を参照し、数量の範囲チェックがされているか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
