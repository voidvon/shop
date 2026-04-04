const blockedTags = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'option',
  'meta',
  'link',
  'base',
])

const allowedTags = new Set([
  'a',
  'blockquote',
  'br',
  'code',
  'del',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  'span',
  'strong',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
])

const allowedAttributeMap = new Map<string, Set<string>>([
  ['a', new Set(['href', 'title', 'target', 'rel'])],
  ['img', new Set(['src', 'alt', 'title'])],
])

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function isSafeHref(value: string) {
  return /^(https?:|mailto:|tel:|\/|#)/i.test(value)
}

function isSafeImageSource(value: string) {
  return /^(https?:|data:image\/|\/)/i.test(value)
}

function sanitizeElementAttributes(element: Element) {
  const tagName = element.tagName.toLowerCase()
  const allowedAttributes = allowedAttributeMap.get(tagName) ?? new Set<string>()

  for (const attribute of [...element.attributes]) {
    const attributeName = attribute.name.toLowerCase()
    const attributeValue = attribute.value.trim()

    if (attributeName.startsWith('on') || attributeName === 'style') {
      element.removeAttribute(attribute.name)
      continue
    }

    if (!allowedAttributes.has(attributeName)) {
      element.removeAttribute(attribute.name)
      continue
    }

    if (tagName === 'a' && attributeName === 'href' && !isSafeHref(attributeValue)) {
      element.removeAttribute(attribute.name)
      continue
    }

    if (tagName === 'img' && attributeName === 'src' && !isSafeImageSource(attributeValue)) {
      element.removeAttribute(attribute.name)
      continue
    }
  }

  if (tagName === 'a' && element.getAttribute('target') === '_blank') {
    element.setAttribute('rel', 'noopener noreferrer')
  }
}

function sanitizeNode(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    node.parentNode?.removeChild(node)
    return
  }

  const element = node as Element
  const tagName = element.tagName.toLowerCase()

  if (blockedTags.has(tagName)) {
    element.remove()
    return
  }

  if (!allowedTags.has(tagName)) {
    const parent = element.parentNode

    if (!parent) {
      element.remove()
      return
    }

    while (element.firstChild) {
      parent.insertBefore(element.firstChild, element)
    }

    parent.removeChild(element)
    return
  }

  sanitizeElementAttributes(element)

  for (const child of [...element.childNodes]) {
    sanitizeNode(child)
  }
}

export function sanitizeRichTextHtml(input: string | null | undefined) {
  const source = input?.trim() ?? ''

  if (!source) {
    return '<p>暂无详情</p>'
  }

  if (typeof DOMParser === 'undefined') {
    return `<p>${escapeHtml(source).replace(/\n/g, '<br>')}</p>`
  }

  if (!source.includes('<')) {
    return `<p>${escapeHtml(source).replace(/\n/g, '<br>')}</p>`
  }

  const document = new DOMParser().parseFromString(source, 'text/html')

  for (const child of [...document.body.childNodes]) {
    sanitizeNode(child)
  }

  const sanitizedHtml = document.body.innerHTML.trim()

  return sanitizedHtml || '<p>暂无详情</p>'
}
