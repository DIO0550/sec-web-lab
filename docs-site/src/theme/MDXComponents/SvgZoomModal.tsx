import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from './SvgZoomModal.module.css';

type Props = {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  onClose: () => void;
};

const MIN_SCALE = 0.5;
const MAX_SCALE = 5.0;
const SCALE_STEP = 0.1;
const DOUBLE_TAP_THRESHOLD = 300;
// 画像の少なくとも20%がビューポート内に見えるようにする
const VISIBLE_RATIO = 0.2;

/**
 * スケール値を MIN_SCALE〜MAX_SCALE の範囲にクランプする
 * @param scale - 入力スケール値
 * @returns クランプされたスケール値
 */
function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

/**
 * translate値を画像の20%がビューポート内に見える範囲にクランプする
 * offsetWidth/Height を使い transform の影響を受けない基準サイズで計算する
 * @param tx - X方向の移動量
 * @param ty - Y方向の移動量
 * @param imgEl - 画像要素
 * @param modalEl - モーダル要素
 * @param targetScale - クランプ対象のスケール値
 * @returns クランプされた translate 値
 */
function clampTranslate(
  tx: number,
  ty: number,
  imgEl: HTMLImageElement | null,
  modalEl: HTMLDivElement | null,
  targetScale: number,
): { tx: number; ty: number } {
  if (!imgEl || !modalEl) return { tx, ty };

  // offsetWidth/Height は transform の影響を受けない基準サイズ
  const baseW = imgEl.offsetWidth;
  const baseH = imgEl.offsetHeight;
  const modalW = modalEl.offsetWidth;
  const modalH = modalEl.offsetHeight;

  // targetScale でのスケール後サイズ
  const scaledW = baseW * targetScale;
  const scaledH = baseH * targetScale;

  // 画像の20%がビューポート内に見える範囲
  const maxTx = modalW / 2 + scaledW * (1 - VISIBLE_RATIO) / 2;
  const maxTy = modalH / 2 + scaledH * (1 - VISIBLE_RATIO) / 2;

  return {
    tx: Math.min(maxTx, Math.max(-maxTx, tx)),
    ty: Math.min(maxTy, Math.max(-maxTy, ty)),
  };
}

// インラインスタイル定義（CSS Modulesが@layerで優先度低下する場合のフォールバック）
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 9999,
  background: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const modalStyle: React.CSSProperties = {
  position: 'relative',
  maxWidth: '100vw',
  maxHeight: '100vh',
  overflow: 'hidden',
};

const closeButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: 8,
  right: 8,
  zIndex: 1,
  background: 'rgba(0, 0, 0, 0.5)',
  color: 'white',
  border: 'none',
  borderRadius: '50%',
  width: 36,
  height: 36,
  cursor: 'pointer',
  fontSize: 18,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 1,
};

const imageBaseStyle: React.CSSProperties = {
  display: 'block',
  objectFit: 'contain',
  touchAction: 'none',
  userSelect: 'none',
  transformOrigin: 'center center',
};

/**
 * SVG画像をモーダルオーバーレイで拡大表示し、ズーム・パン操作を提供するコンポーネント
 * @param props - src: 画像URL, alt: 代替テキスト, onClose: 閉じるコールバック
 * @returns モーダルのPortal、またはSSR時はnull
 */
export function SvgZoomModal({ src, alt, width, height, onClose }: Props) {
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [fittedSize, setFittedSize] = useState<{ width: number; height: number } | null>(null);

  const dragStartRef = useRef({ x: 0, y: 0 });
  const translateStartRef = useRef({ x: 0, y: 0 });
  const lastTapTimeRef = useRef(0);
  const activePointersRef = useRef(new Map<number, PointerEvent>());
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef(1);
  const pinchStartMidRef = useRef({ x: 0, y: 0 });
  const pinchStartTranslateRef = useRef({ x: 0, y: 0 });
  const pinchImageCenterRef = useRef({ x: 0, y: 0 });

  const modalRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const resetTransform = useCallback(() => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  }, []);

  // SSR ガード: hooks の後に配置し、useEffect でクライアント判定
  useEffect(() => {
    setMounted(true);
  }, []);

  // Escape キー
  useEffect(() => {
    /** Escapeキーでモーダルを閉じる */
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // body overflow hidden
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // 初期フォーカス + フォーカストラップ
  useEffect(() => {
    closeButtonRef.current?.focus();

    /** Tab キーによるフォーカストラップ処理 */
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, []);

  /** 2つのポインター間の距離を算出する */
  const getPointerDistance = useCallback((p1: PointerEvent, p2: PointerEvent) => {
    const dx = p1.clientX - p2.clientX;
    const dy = p1.clientY - p2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  /** 2つのポインターの中心座標を算出する */
  const getPointerMidpoint = useCallback((p1: PointerEvent, p2: PointerEvent) => ({
    x: (p1.clientX + p2.clientX) / 2,
    y: (p1.clientY + p2.clientY) / 2,
  }), []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const img = imageRef.current;
      const modal = modalRef.current;
      if (!img) return;

      const delta = e.deltaY > 0 ? -SCALE_STEP : SCALE_STEP;
      const newScale = clampScale(scale + delta);
      const ratio = newScale / scale;

      // マウスカーソル位置を中心にズーム
      const rect = img.getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;

      const newTx = translateX - cx * (ratio - 1);
      const newTy = translateY - cy * (ratio - 1);
      const clamped = clampTranslate(newTx, newTy, img, modal, newScale);

      setScale(newScale);
      setTranslateX(clamped.tx);
      setTranslateY(clamped.ty);
    },
    [scale, translateX, translateY],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const pointers = activePointersRef.current;
      pointers.set(e.pointerId, e.nativeEvent);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      // ダブルタップ判定
      const now = Date.now();
      if (now - lastTapTimeRef.current < DOUBLE_TAP_THRESHOLD && pointers.size === 1) {
        resetTransform();
        lastTapTimeRef.current = 0;
        return;
      }
      lastTapTimeRef.current = now;

      if (pointers.size === 1) {
        // シングルポインター: ドラッグ開始
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        translateStartRef.current = { x: translateX, y: translateY };
      } else if (pointers.size === 2) {
        // ピンチ開始: 距離・中心点・translate・画像中心を保持
        setIsDragging(false);
        const [p1, p2] = [...pointers.values()];
        pinchStartDistRef.current = getPointerDistance(p1, p2);
        pinchStartScaleRef.current = scale;
        pinchStartMidRef.current = getPointerMidpoint(p1, p2);
        pinchStartTranslateRef.current = { x: translateX, y: translateY };
        // モーダル中心 = transform前の画像中心（レイアウト位置は不変）
        if (modalRef.current) {
          const mr = modalRef.current.getBoundingClientRect();
          pinchImageCenterRef.current = { x: mr.left + mr.width / 2, y: mr.top + mr.height / 2 };
        }
      }
    },
    [translateX, translateY, scale, resetTransform, getPointerDistance, getPointerMidpoint],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const pointers = activePointersRef.current;
      pointers.set(e.pointerId, e.nativeEvent);

      const img = imageRef.current;
      const modal = modalRef.current;

      if (pointers.size === 2 && pinchStartDistRef.current !== null) {
        // ピンチズーム + パン同時操作（ピンチ中心基準ズーム）
        const [p1, p2] = [...pointers.values()];
        const dist = getPointerDistance(p1, p2);
        const scaleRatio = dist / pinchStartDistRef.current;
        const newScale = clampScale(pinchStartScaleRef.current * scaleRatio);
        const r = newScale / pinchStartScaleRef.current;

        const mid = getPointerMidpoint(p1, p2);
        const dMx = mid.x - pinchStartMidRef.current.x;
        const dMy = mid.y - pinchStartMidRef.current.y;
        const c = pinchImageCenterRef.current;
        const m0 = pinchStartMidRef.current;
        const t0 = pinchStartTranslateRef.current;

        // ピンチ開始時の中心点の下にあった画像上の点が、
        // 現在の中心点の下に来るよう translate を算出
        const newTx = t0.x * r + dMx + (m0.x - c.x) * (1 - r);
        const newTy = t0.y * r + dMy + (m0.y - c.y) * (1 - r);

        const clamped = clampTranslate(newTx, newTy, img, modal, newScale);
        setScale(newScale);
        setTranslateX(clamped.tx);
        setTranslateY(clamped.ty);
      } else if (isDragging && pointers.size === 1) {
        // ドラッグパン
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        const newTx = translateStartRef.current.x + dx;
        const newTy = translateStartRef.current.y + dy;

        const clamped = clampTranslate(newTx, newTy, img, modal, scale);
        setTranslateX(clamped.tx);
        setTranslateY(clamped.ty);
      }
    },
    [isDragging, scale, translateX, translateY, getPointerDistance, getPointerMidpoint],
  );

  /** ポインター解放時の共通クリーンアップ */
  const cleanupPointer = useCallback((pointerId: number, target?: EventTarget | null) => {
    const pointers = activePointersRef.current;
    pointers.delete(pointerId);
    if (target) {
      try {
        (target as HTMLElement).releasePointerCapture(pointerId);
      } catch {
        // pointer capture が既に解放されている場合は無視
      }
    }
    if (pointers.size < 2) {
      pinchStartDistRef.current = null;
    }
    if (pointers.size === 0) {
      setIsDragging(false);
    }
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      cleanupPointer(e.pointerId, e.target);
    },
    [cleanupPointer],
  );

  const handlePointerCancel = useCallback(
    (e: React.PointerEvent) => {
      cleanupPointer(e.pointerId, e.target);
    },
    [cleanupPointer],
  );

  const handleLostPointerCapture = useCallback(
    (e: React.PointerEvent) => {
      cleanupPointer(e.pointerId);
    },
    [cleanupPointer],
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      resetTransform();
    },
    [resetTransform],
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  // SSR時はportalを使わない（hydration対策）
  if (!mounted) return null;

  return createPortal(
    <div
      className={styles.overlay}
      style={overlayStyle}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={alt || 'SVG画像の拡大表示'}
    >
      <div
        ref={modalRef}
        className={styles.modal}
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          className={styles.closeButton}
          style={closeButtonStyle}
          onClick={onClose}
          aria-label="閉じる"
          type="button"
        >
          ×
        </button>
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          width={fittedSize?.width ?? width}
          height={fittedSize?.height ?? height}
          className={`${styles.image}${isDragging ? ` ${styles.dragging}` : ''}`}
          style={{
            ...imageBaseStyle,
            ...(fittedSize ? { width: fittedSize.width, height: fittedSize.height } : {}),
            cursor: isDragging ? 'grabbing' : 'grab',
            transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
          }}
          onLoad={(e) => {
            const img = e.currentTarget;
            const vw = window.innerWidth * 0.95;
            const vh = window.innerHeight * 0.95;
            const ratio = img.naturalWidth / img.naturalHeight;
            let w = vw;
            let h = vw / ratio;
            if (h > vh) {
              h = vh;
              w = vh * ratio;
            }
            setFittedSize({ width: w, height: h });
          }}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onLostPointerCapture={handleLostPointerCapture}
          onDoubleClick={handleDoubleClick}
          draggable={false}
        />
      </div>
    </div>,
    document.body,
  );
}
