import type { ImgHTMLAttributes } from "react";
import { THUMB_PX, useThumb } from "../lib/thumb";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string | undefined;
  /** 缩略图最长边的像素数。按显示尺寸乘以屏幕倍数取，默认够两百像素宽的封面用。 */
  px?: number;
};

/**
 * 列表里的图片：大图先缩成缩略图再显示，缩略图存在本地，下次直接读。
 * 缩略图还没好时不画，底下的占位色露出来；生成失败时显示原图。
 */
export function ThumbImage({ src, px = THUMB_PX, alt = "", ...rest }: Props) {
  const url = useThumb(src, px);
  return url ? <img {...rest} src={url} alt={alt} /> : null;
}
