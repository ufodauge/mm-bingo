// ES2025 正式サポートまでの耐え

/**
 * Uint8Array の Base64 拡張メソッドの型定義
 */
interface Uint8Array {
  /**
   * Uint8Array の内容を Base64 または Base64url 文字列に変換します。
   */
  toBase64(options?: {
    alphabet?: 'base64' | 'base64url';
    omitPadding?: boolean;
  }): string;

  /**
   * Uint8Array の内容を 16 進数文字列に変換します（関連メソッド）。
   */
  toHex(): string;
}

interface Uint8ArrayConstructor {
  /**
   * Base64 または Base64url 文字列から Uint8Array を作成します。
   */
  fromBase64(
    base64: string,
    options?: {
      alphabet?: 'base64' | 'base64url';
      lastChunkHandling?: 'loose' | 'strict' | 'stop-before-partial';
    }
  ): Uint8Array;

  /**
   * 16 進数文字列から Uint8Array を作成します（関連メソッド）。
   */
  fromHex(hex: string): Uint8Array;
}
