/**
 * Helper class for template processing and variable replacement
 */
class TemplateHelper {
  /**
   * Replace template variables in a string
   * @param {string} template - Template string with variables
   * @param {Object} post - Blog post data
   * @param {Object} config - Configuration object
   * @returns {string} Template with variables replaced
   */
  replaceTemplateVariables(template, post, config) {
    if (!template || typeof template !== 'string') {
      return '';
    }

    let result = template;

    // Post variables
    const postVars = {
      '{{title}}': post.title || '',
      '{{description}}': post.description || '',
      '{{url}}': post.url || '',
      '{{coverImage}}': post.coverImage || '',
      '{{publishedAt}}': post.publishedAt || '',
      '{{formattedDate}}': post.formattedDate || '',
      '{{slug}}': post.slug || '',
      '{{authorName}}': post.author?.name || '',
      '{{authorUsername}}': post.author?.username || '',
      '{{readTime}}': post.readTime || 0,
      '{{id}}': post.id || ''
    };

    // Config variables
    const configVars = {
      '{{imageWidth}}': config.imageWidth || 100,
      '{{imageHeight}}': config.imageHeight || 100,
      '{{cardWidth}}': config.cardWidth || 400,
      '{{customCss}}': config.customCss || ''
    };

    // Replace all variables
    const allVars = { ...postVars, ...configVars };

    for (const [variable, value] of Object.entries(allVars)) {
      result = result.replace(new RegExp(this.escapeRegExp(variable), 'g'), String(value));
    }

    return result;
  }

  /**
   * Escape special regex characters
   * @param {string} string - String to escape
   * @returns {string} Escaped string
   */
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Generate HTML for image element
   * @param {string} src - Image source URL
   * @param {string} alt - Alt text
   * @param {Object} options - Image styling options
   * @returns {string} HTML image element
   */
  generateImageHtml(src, alt, options = {}) {
    const {
      width = 100,
      height = 100,
      borderRadius = '6px',
      objectFit = 'cover',
      className = '',
      style = ''
    } = options;

    const styles = [
      `width: ${width}px`,
      `height: ${height}px`,
      `object-fit: ${objectFit}`,
      `border-radius: ${borderRadius}`,
      style
    ]
      .filter(s => s)
      .join('; ');

    const classAttr = className ? ` class="${className}"` : '';

    return `<img src="${src}" alt="${this.escapeHtml(alt)}"${classAttr} style="${styles}" />`;
  }

  /**
   * Generate HTML for link element
   * @param {string} href - Link URL
   * @param {string} text - Link text
   * @param {Object} options - Link options
   * @returns {string} HTML link element
   */
  generateLinkHtml(href, text, options = {}) {
    const {
      target = '',
      rel = '',
      className = '',
      style = 'text-decoration: none; color: #1a1a1a;'
    } = options;

    const targetAttr = target ? ` target="${target}"` : '';
    const relAttr = rel ? ` rel="${rel}"` : '';
    const classAttr = className ? ` class="${className}"` : '';
    const styleAttr = style ? ` style="${style}"` : '';

    return `<a href="${href}"${targetAttr}${relAttr}${classAttr}${styleAttr}>${this.escapeHtml(text)}</a>`;
  }

  /**
   * Generate HTML for container div
   * @param {string} content - Content inside the div
   * @param {Object} options - Container options
   * @returns {string} HTML div element
   */
  generateContainerHtml(content, options = {}) {
    const { className = '', style = '', id = '' } = options;

    const classAttr = className ? ` class="${className}"` : '';
    const styleAttr = style ? ` style="${style}"` : '';
    const idAttr = id ? ` id="${id}"` : '';

    return `<div${idAttr}${classAttr}${styleAttr}>${content}</div>`;
  }

  /**
   * Escape HTML special characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    if (typeof text !== 'string') {
      return '';
    }

    const htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    return text.replace(/[&<>"']/g, match => htmlEscapes[match]);
  }

  /**
   * Truncate text to specified length
   * @param {string} text - Text to truncate
   * @param {number} length - Maximum length
   * @param {string} suffix - Suffix to add when truncated
   * @returns {string} Truncated text
   */
  truncateText(text, length = 200, suffix = '...') {
    if (!text || typeof text !== 'string') {
      return '';
    }

    if (text.length <= length) {
      return text;
    }

    return text.substring(0, length).trim() + suffix;
  }

  /**
   * Generate CSS for responsive design
   * @param {Object} breakpoints - Breakpoint definitions
   * @returns {string} CSS media queries
   */
  generateResponsiveCss(breakpoints = {}) {
    const defaults = {
      mobile: '480px',
      tablet: '768px',
      desktop: '1024px'
    };

    const bp = { ...defaults, ...breakpoints };

    return `
      @media (max-width: ${bp.mobile}) {
        .blog-card { flex-direction: column; }
        .blog-card img { width: 100%; height: 200px; margin: 0 0 12px 0; }
      }
      
      @media (max-width: ${bp.tablet}) {
        .blog-card { max-width: 100%; }
      }
      
      @media (min-width: ${bp.desktop}) {
        .blog-card { max-width: 800px; }
      }
    `.trim();
  }

  /**
   * Generate structured data (JSON-LD) for blog posts
   * @param {Array} posts - Blog posts array
   * @param {Object} config - Configuration object
   * @returns {string} JSON-LD structured data
   */
  generateStructuredData(posts, config) {
    const items = posts.map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      url: post.url,
      datePublished: post.publishedAt,
      author: {
        '@type': 'Person',
        name: post.author.name
      },
      image: post.coverImage
    }));

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: item
      }))
    };

    return JSON.stringify(structuredData, null, 2);
  }

  /**
   * Generate markdown table
   * @param {Array} data - Table data
   * @param {Array} headers - Table headers
   * @returns {string} Markdown table
   */
  generateMarkdownTable(data, headers) {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }

    const headerRow = `| ${headers.join(' | ')} |`;
    const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;

    const dataRows = data.map(row => `| ${headers.map(header => row[header] || '').join(' | ')} |`);

    return [headerRow, separatorRow, ...dataRows].join('\n');
  }

  /**
   * Clean and sanitize HTML content
   * @param {string} html - HTML content to clean
   * @returns {string} Cleaned HTML
   */
  sanitizeHtml(html) {
    if (!html || typeof html !== 'string') {
      return '';
    }

    // Remove script tags and their content
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove dangerous attributes
    html = html.replace(/\s*(on\w+|javascript:|data:)\s*=\s*["'][^"']*["']/gi, '');

    return html;
  }

  /**
   * Generate CSS variables for theming
   * @param {Object} theme - Theme configuration
   * @returns {string} CSS custom properties
   */
  generateThemeVariables(theme = {}) {
    const defaults = {
      primaryColor: '#1a1a1a',
      secondaryColor: '#6b7280',
      backgroundColor: '#ffffff',
      borderColor: '#e1e5e9',
      borderRadius: '8px',
      fontSize: '14px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    };

    const themeVars = { ...defaults, ...theme };

    const cssVars = Object.entries(themeVars)
      .map(([key, value]) => `  --blog-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
      .join('\n');

    return `:root {\n${cssVars}\n}`;
  }
}

module.exports = { TemplateHelper };
