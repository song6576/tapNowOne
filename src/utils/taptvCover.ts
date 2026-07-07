/**
 * TapTV 封面类型判断
 *
 * taptv_work.cover 有两种形态：
 * 1. 图片 URL（http、/uploads、data:）→ 列表用 <img> 展示
 * 2. CSS 渐变（linear-gradient(...)）→ 列表用 <div style={{ background }}> 展示
 *
 * 无论哪种，鼠标悬浮时都切换到 video_url 播放。
 */

/** 封面是否为可加载的图片 URL（区别于 CSS linear-gradient 渐变） */
export function isTapTVCoverImage(cover?: string): boolean {
  if (!cover) return false
  return (
    cover.startsWith('http') ||
    cover.startsWith('/') ||
    cover.startsWith('data:') ||
    cover.startsWith('//')
  )
}
