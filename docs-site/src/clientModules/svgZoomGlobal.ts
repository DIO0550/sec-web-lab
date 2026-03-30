/**
 * .md (CommonMark) ページでもSVG画像をクリックで拡大表示するためのクライアントモジュール。
 * .mdx ページでは MDXComponents/Img.tsx が同等の機能を提供するため、
 * MDXComponents経由で既にボタンラップされた画像は二重適用しない。
 */

const SVG_ZOOM_ATTR = 'data-svg-zoom-bound';

/**
 * SVG画像かどうかを判定する（ファイルURL・data URI両対応）
 * @param src - 画像のsrc属性
 * @returns SVG画像の場合true
 */
function isSvgSrc(src: string | undefined | null): boolean {
  if (!src) return false;
  if (src.startsWith('data:image/svg+xml')) return true;
  const pathname = src.split('?')[0].split('#')[0];
  return pathname.toLowerCase().endsWith('.svg');
}

/**
 * SVG画像の拡大表示モーダルを生成する
 * @param src - 画像のURL
 * @param alt - 代替テキスト
 * @returns モーダルのオーバーレイ要素
 */
function createModal(src: string, alt: string): HTMLDivElement {
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '9999',
    background: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'zoom-out',
  });

  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  Object.assign(img.style, {
    display: 'block',
    objectFit: 'contain',
  });

  /** 画像読み込み後にビューポートに最大フィットするサイズを計算して適用する */
  const fitToViewport = (): void => {
    const vw = window.innerWidth * 0.95;
    const vh = window.innerHeight * 0.95;
    const ratio = img.naturalWidth / img.naturalHeight;

    let w = vw;
    let h = vw / ratio;
    if (h > vh) {
      h = vh;
      w = vh * ratio;
    }

    img.style.width = `${w}px`;
    img.style.height = `${h}px`;
  };

  img.addEventListener('load', fitToViewport);
  // base64 data URI は同期的に読み込まれる場合がある
  if (img.complete && img.naturalWidth > 0) fitToViewport();

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '\u00d7';
  closeBtn.setAttribute('aria-label', '閉じる');
  Object.assign(closeBtn.style, {
    position: 'absolute',
    top: '12px',
    right: '12px',
    zIndex: '1',
    background: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  /** モーダルを閉じてbodyのスクロールを復元する */
  const close = (): void => {
    document.body.style.overflow = prevOverflow;
    overlay.remove();
    document.removeEventListener('keydown', onKey);
  };

  /** Escapeキーでモーダルを閉じるキーボードハンドラ */
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') close();
  };

  /** オーバーレイまたは閉じるボタンクリックでモーダルを閉じるハンドラ */
  const handleOverlayClick = (e: MouseEvent): void => {
    if (e.target === overlay || e.target === closeBtn) close();
  };

  overlay.addEventListener('click', handleOverlayClick);
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', onKey);

  overlay.appendChild(closeBtn);
  overlay.appendChild(img);
  return overlay;
}

/**
 * ページ内のSVG画像にクリックズーム機能をバインドする。
 * MDXComponents/Img.tsxで既にボタンラップされた画像は二重適用しない。
 */
function bindSvgZoom(): void {
  const images = document.querySelectorAll<HTMLImageElement>(
    'article img, .markdown img, [class*="docItemCol"] img',
  );

  for (const img of Array.from(images)) {
    if (img.hasAttribute(SVG_ZOOM_ATTR)) continue;
    if (img.closest('button')) continue;
    if (!isSvgSrc(img.getAttribute('src'))) continue;

    img.setAttribute(SVG_ZOOM_ATTR, 'true');
    img.style.cursor = 'zoom-in';

    /** SVG画像クリック時にモーダルを表示するハンドラ */
    const handleClick = (): void => {
      const modal = createModal(img.src, img.alt || 'SVG画像');
      document.body.appendChild(modal);
    };

    img.addEventListener('click', handleClick);
  }
}

// ページ遷移(SPA)ごとにバインドし直す
if (typeof window !== 'undefined') {
  /** DOM変更を監視してSVGズームバインドを再適用するオブザーバー */
  const observer = new MutationObserver(() => {
    bindSvgZoom();
  });

  /** 初期バインド + DOM変更の監視を開始する */
  const init = (): void => {
    bindSvgZoom();
    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

export {};
