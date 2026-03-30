import type { ComponentProps } from 'react';
import { useState, useRef, useCallback } from 'react';
import { SvgZoomModal } from './SvgZoomModal';

/**
 * URLからクエリパラメータ・ハッシュを除去し、.svg で終わるかを判定する
 * @param src - 画像のsrc属性
 * @returns SVG画像の場合true
 */
function isSvgSrc(src: string | undefined): boolean {
  if (!src) return false;
  if (src.startsWith('data:image/svg+xml')) return true;
  const pathname = src.split('?')[0].split('#')[0];
  return pathname.toLowerCase().endsWith('.svg');
}

/**
 * MDX内のimgタグをラップし、SVG画像にクリックでズームモーダルを表示する機能を付与する
 * @param props - img要素の標準props
 * @returns SVG画像はボタンでラップされたimg + モーダル、非SVGはそのままimg
 */
export default function Img(props: ComponentProps<'img'>) {
  const { src, alt, ...rest } = props;
  const [modalSrc, setModalSrc] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    setModalSrc(null);
    triggerRef.current?.focus();
  }, []);

  if (!isSvgSrc(src)) {
    return <img {...props} />;
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setModalSrc(src!)}
        style={{ cursor: 'zoom-in', border: 'none', padding: 0, background: 'none' }}
        aria-label={`${alt || 'SVG画像'}を拡大表示`}
      >
        <img {...rest} src={src} alt={alt} />
      </button>
      {modalSrc && (
        <SvgZoomModal src={modalSrc} alt={alt || ''} width={props.width} height={props.height} onClose={handleClose} />
      )}
    </>
  );
}
