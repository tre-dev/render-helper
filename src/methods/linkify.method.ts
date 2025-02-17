import { IMG_REGEX } from '../consts'
import { proxifyImageSrc } from '../proxify-image-src'

export function linkify(content: string, forApp: boolean, webp: boolean): string {
  // Tags
  content = content.replace(/(^|\s|>)(#[-a-z\d]+)/gi, tag => {
    if (/#[\d]+$/.test(tag)) return tag // do not allow only numbers (like #1)
    const preceding = /^\s|>/.test(tag) ? tag[0] : '' // space or closing tag (>)
    tag = tag.replace('>', '') // remove closing tag
    const tag2 = tag.trim().substring(1)
    const tagLower = tag2.toLowerCase()

    const attrs = forApp ? `data-tag="${tagLower}"` : `href="/trending/${tagLower}"`
    return `${preceding}<a class="markdown-tag-link" ${attrs}>${tag.trim()}</a>`
  })

  // User mentions
  content = content.replace(
    /(^|[^a-zA-Z0-9_!#$%&*@＠/]|(^|[^a-zA-Z0-9_+~.-/]))[@＠]([a-z][-.a-z\d^/]+[a-z\d])/gi,
    (match, preceeding1, preceeding2, user) => {
      const userLower = user.toLowerCase()
      const preceedings = (preceeding1 || '') + (preceeding2 || '')
      if (userLower.indexOf('/')===-1) {
        const attrs = forApp ? `data-author="${userLower}"` : `href="/@${userLower}"`
        return `${preceedings}<a class="markdown-author-link" ${attrs}>@${user}</a>`  
      } else {
        return match
      }
    }
  )

  // internal links
  content = content.replace(
    /((^|\s)(\/|)@[\w.\d-]+)\/(\S+)/gi, (match, u, p1, p2, p3) => {
      const uu = u.trim().toLowerCase().replace('/@','').replace('@','');
      const perm = p3;
      if (['wallet', 'feed', 'followers', 'following', 'points', 'communities', 'posts', 'blog', 'comments', 'replies', 'settings', 'engine'].includes(p3)) {
        const attrs = forApp ? `https://ecency.com/@${uu}/${perm}` : `href="/@${uu}/${perm}"`
        return ` <a class="markdown-profile-link" ${attrs}>@${uu}/${perm}</a>`
      } else {
        const attrs = forApp ? `data-author="${uu}" data-tag="post" data-permlink="${perm}"` : `href="/post/@${uu}/${perm}"`
        return ` <a class="markdown-post-link" ${attrs}>@${uu}/${perm}</a>`  
      }
    }
  )

  // Image links
  content = content.replace(IMG_REGEX, imglink => {
    const attrs = forApp ? `data-href="${imglink}" class="markdown-img-link" src="${proxifyImageSrc(imglink, 0, 0, webp ? 'webp' : 'match')}"` : `class="markdown-img-link" src="${proxifyImageSrc(imglink, 0, 0, webp ? 'webp' : 'match')}"`
    return `<img ${attrs}/>`
  })

  return content
}
