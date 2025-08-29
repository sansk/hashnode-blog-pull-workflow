const { TemplateHelper } = require('../helpers/TemplateHelper');
const { Logger } = require('../helpers/Logger');

/**
 * Service for generating content templates
 */
class TemplateService {
  constructor() {
    this.logger = new Logger();
    this.templateHelper = new TemplateHelper();
  }

  /**
   * Generate content based on display format
   * @param {Array} posts - Array of blog posts
   * @param {Object} config - Configuration object
   * @returns {string} Generated content
   */
  generateContent(posts, config) {
    if (!posts || posts.length === 0) {
      return config.noPostsMessage || 'No blog posts found.';
    }

    this.logger.debug(
      `Generating content for ${posts.length} posts with format: ${config.displayFormat}`
    );

    // Process posts (truncate description, format dates, etc.)
    const processedPosts = posts.map(post => this.processPost(post, config));

    switch (config.displayFormat) {
      case 'card':
        return this.generateCards(processedPosts, config);
      case 'stacked-left':
        return this.generateStackedCards(processedPosts, config, 'left');
      case 'stacked-right':
        return this.generateStackedCards(processedPosts, config, 'right');
      case 'list':
        return this.generateList(processedPosts, config);
      case 'table':
        return this.generateTable(processedPosts, config);
      default:
        this.logger.warn(`Unknown display format: ${config.displayFormat}, using stacked-left`);
        return this.generateStackedCards(processedPosts, config, 'left');
    }
  }

  /**
   * Process individual post data
   * @param {Object} post - Blog post object
   * @param {Object} config - Configuration object
   * @returns {Object} Processed post object
   */
  processPost(post, config) {
    const processed = { ...post };

    // Truncate description
    if (processed.description && processed.description.length > config.descriptionLength) {
      processed.description = processed.description.substring(0, config.descriptionLength) + '...';
    }

    // Ensure we have a fallback image
    if (!processed.coverImage) {
      processed.coverImage = 'https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Blog+Post';
    }

    return processed;
  }

  /**
   * Generate card format content
   * @param {Array} posts - Processed blog posts
   * @param {Object} config - Configuration object
   * @returns {string} Generated card content
   */
  generateCards(posts, config) {
    const cards = posts.map(post => {
      return `
<div style="border: 1px solid #e1e5e9; border-radius: 8px; padding: 16px; margin: 16px 0; max-width: ${config.cardWidth}px; ${config.customCss}">
  <img src="${post.coverImage}" alt="${post.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 6px; margin-bottom: 12px;" />
  <h3 style="margin: 0 0 8px 0; font-size: 18px;">
    <a href="${post.url}" style="text-decoration: none; color: #1a1a1a;">${post.title}</a>
  </h3>
  <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">${post.formattedDate}</p>
  <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.5;">${post.description}</p>
</div>`.trim();
    });

    return cards.join('\n\n');
  }

  /**
   * Generate stacked card format content
   * @param {Array} posts - Processed blog posts
   * @param {Object} config - Configuration object
   * @param {string} imagePosition - 'left' or 'right'
   * @returns {string} Generated stacked card content
   */
  generateStackedCards(posts, config, imagePosition = 'left') {
    const cards = posts.map(post => {
      const imageElement = `<img src="${post.coverImage}" alt="${post.title}" style="width: ${config.imageWidth}px; height: ${config.imageHeight}px; object-fit: cover; border-radius: 6px;" />`;

      const contentElement = `
<div style="flex: 1;">
  <h3 style="margin: 0 0 4px 0; font-size: 16px;">
    <a href="${post.url}" style="text-decoration: none; color: #1a1a1a;">${post.title}</a>
  </h3>
  <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px;">${post.formattedDate}</p>
  <p style="margin: 0; color: #4b5563; font-size: 13px; line-height: 1.4;">${post.description}</p>
</div>`.trim();

      const flexDirection = imagePosition === 'left' ? 'row' : 'row-reverse';
      const gap = imagePosition === 'left' ? '0 12px 0 0' : '0 0 0 12px';

      return `
<div style="display: flex; flex-direction: ${flexDirection}; align-items: flex-start; padding: 12px; border: 1px solid #e1e5e9; border-radius: 8px; margin: 8px 0; ${config.customCss}">
  <div style="margin: ${gap};">
    ${imageElement}
  </div>
  ${contentElement}
</div>`.trim();
    });

    return cards.join('\n\n');
  }

  /**
   * Generate list format content
   * @param {Array} posts - Processed blog posts
   * @param {Object} config - Configuration object
   * @returns {string} Generated list content
   */
  generateList(posts, config) {
    const listItems = posts.map(post => {
      return `- **${post.formattedDate}**: [${post.title}](${post.url})`;
    });

    return listItems.join('\n');
  }

  /**
   * Generate table format content
   * @param {Array} posts - Processed blog posts
   * @param {Object} config - Configuration object
   * @returns {string} Generated table content
   */
  generateTable(posts, config) {
    const tableStyle = `border-collapse: collapse; width: 100%; margin: 16px 0; ${config.customCss}`;
    const thStyle =
      'border: 1px solid #e1e5e9; padding: 12px; text-align: left; background-color: #f8f9fa; font-weight: 600;';
    const tdStyle = 'border: 1px solid #e1e5e9; padding: 12px; vertical-align: top;';

    const headerRow = `<tr>
        <th style="${thStyle}">Date</th>
        <th style="${thStyle}">Image</th>
        <th style="${thStyle}">Title & Description</th>
      </tr>`;

    const rows = posts.map(post => {
      const imageCell = `<img src="${post.coverImage}" alt="${post.title}" style="width: ${config.imageWidth}px; height: ${config.imageHeight}px; object-fit: cover; border-radius: 4px;" />`;
      const titleCell = `<a href="${post.url}" style="text-decoration: none; color: #1a1a1a; font-weight: 600;">${post.title}</a><br/><span style="color: #6b7280; font-size: 14px;">${post.description}</span>`;

      return `<tr>
          <td style="${tdStyle}">${post.formattedDate}</td>
          <td style="${tdStyle}">${imageCell}</td>
          <td style="${tdStyle}">${titleCell}</td>
        </tr>`;
    });

    return `<table style="${tableStyle}">
  <thead>
    ${headerRow}
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>`.trim();
  }

  //   /**
  //    * Generate custom format content using user-defined template
  //    * @param {Array} posts - Processed blog posts
  //    * @param {Object} config - Configuration object
  //    * @param {string} template - Custom template string
  //    * @returns {string} Generated content
  //    */
  //   generateCustomFormat(posts, config, template) {
  //     return posts
  //       .map(post => {
  //         return this.templateHelper.replaceTemplateVariables(template, post, config);
  //       })
  //       .join('\n\n');
  //   }
}

module.exports = { TemplateService };
