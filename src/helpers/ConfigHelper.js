const { getInput } = require('@actions/core');

/**
 * Helper class for managing configuration
 */
class ConfigHelper {
  /**
   * Get configuration from GitHub Action inputs
   * @returns {Object} Configuration object
   */
  static getConfig() {
    return {
      publicationName: getInput('publication_name'),
      postCount: parseInt(getInput('post_count') || '6', 10),
      displayFormat: getInput('display_format') || 'stacked-left',
      filename: getInput('filename') || 'README.md',
      githubToken: getInput('github_token'),

      // Customization options
      cardWidth: parseInt(getInput('card_width') || '500', 10),
      imageWidth: parseInt(getInput('image_width') || '100', 10),
      imageHeight: parseInt(getInput('image_height') || '100', 10),
      dateFormat: getInput('date_format') || 'MMM DD, YYYY',
      descriptionLength: parseInt(getInput('description_length') || '200', 10),
      customCss: getInput('custom_css') || '',
      sectionTitle: getInput('section_title') || '✍️ Latest Blog Posts',
      noPostsMessage: getInput('no_posts_message') || 'No blog posts found.',
      targetBranch: getInput('target_branch') || 'main'
    };
  }

  /**
   * Get supported display formats
   * @returns {Array} Array of supported formats
   */
  static getSupportedFormats() {
    return ['card', 'stacked-left', 'stacked-right', 'list', 'table'];
  }

  /**
   * Get supported date formats
   * @returns {Object} Object with format keys and examples
   */
  static getSupportedDateFormats() {
    return {
      'MMM DD, YYYY': 'Jan 15, 2024',
      'DD/MM/YYYY': '15/01/2024',
      'YYYY-MM-DD': '2024-01-15',
      'MMMM Do, YYYY': 'January 15th, 2024',
      'MMM YYYY': 'Jan 2024',
      relative: '2 days ago'
    };
  }
}

module.exports = { ConfigHelper };
