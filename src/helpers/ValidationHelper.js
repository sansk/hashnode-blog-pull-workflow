const { ConfigHelper } = require('./ConfigHelper');
const { Logger } = require('./Logger');

/**
 * Helper class for validating inputs
 */
class ValidationHelper {
  constructor() {
    this.logger = new Logger();
  }

  /**
   * Validate all configuration inputs
   * @param {Object} config - Configuration object to validate
   * @throws {Error} If validation fails
   */
  validateInputs(config) {
    this.validatePublicationName(config.publicationName);
    this.validatePostCount(config.postCount);
    this.validateDisplayFormat(config.displayFormat);
    this.validateFilename(config.filename);
    this.validateCustomizationOptions(config);

    this.logger.info('All inputs validated successfully');
  }

  /**
   * Validate publication name
   * @param {string} publicationName - Hashnode publication name
   * @throws {Error} If publication name is invalid
   */
  validatePublicationName(publicationName) {
    if (!publicationName || typeof publicationName !== 'string') {
      throw new Error('Publication name is required and must be a string');
    }

    if (publicationName.trim().length === 0) {
      throw new Error('Publication name cannot be empty');
    }

    // Basic validation for Hashnode publication name format
    const validFormat = /^[a-zA-Z0-9-._]+$/;
    if (!validFormat.test(publicationName)) {
      throw new Error(
        'Publication name contains invalid characters. Use only letters, numbers, hyphens, dots, and underscores.'
      );
    }

    if (publicationName.length > 100) {
      throw new Error('Publication name is too long (max 100 characters)');
    }
  }

  /**
   * Validate post count
   * @param {number} postCount - Number of posts to fetch
   * @throws {Error} If post count is invalid
   */
  validatePostCount(postCount) {
    if (typeof postCount !== 'number' || isNaN(postCount)) {
      throw new Error('Post count must be a valid number');
    }

    if (postCount < 1) {
      throw new Error('Post count must be at least 1');
    }

    if (postCount > 12) {
      throw new Error('Post count cannot exceed 12');
    }

    if (!Number.isInteger(postCount)) {
      throw new Error('Post count must be an integer');
    }
  }

  /**
   * Validate display format
   * @param {string} displayFormat - Display format option
   * @throws {Error} If display format is invalid
   */
  validateDisplayFormat(displayFormat) {
    if (!displayFormat || typeof displayFormat !== 'string') {
      throw new Error('Display format is required and must be a string');
    }

    const supportedFormats = ConfigHelper.getSupportedFormats();
    if (!supportedFormats.includes(displayFormat)) {
      throw new Error(
        `Unsupported display format: ${displayFormat}. Supported formats: ${supportedFormats.join(', ')}`
      );
    }
  }

  /**
   * Validate filename
   * @param {string} filename - Target filename
   * @throws {Error} If filename is invalid
   */
  validateFilename(filename) {
    if (!filename || typeof filename !== 'string') {
      throw new Error('Filename is required and must be a string');
    }

    if (filename.trim().length === 0) {
      throw new Error('Filename cannot be empty');
    }

    // Check for invalid characters in filename
    const invalidChars = /[<>:"|?*]/;
    if (invalidChars.test(filename)) {
      throw new Error('Filename contains invalid characters');
    }

    // Check for relative path traversal
    if (filename.includes('..') || filename.startsWith('/')) {
      throw new Error('Filename cannot contain path traversal or absolute paths');
    }

    if (filename.length > 255) {
      throw new Error('Filename is too long (max 255 characters)');
    }
  }

  /**
   * Validate customization options
   * @param {Object} config - Configuration object
   * @throws {Error} If customization options are invalid
   */
  validateCustomizationOptions(config) {
    // Validate numeric options
    this.validateNumericOption('cardWidth', config.cardWidth, 100, 1200);
    this.validateNumericOption('imageWidth', config.imageWidth, 50, 500);
    this.validateNumericOption('imageHeight', config.imageHeight, 50, 500);
    this.validateNumericOption('descriptionLength', config.descriptionLength, 50, 1000);

    // Validate date format
    if (config.dateFormat && typeof config.dateFormat !== 'string') {
      throw new Error('Date format must be a string');
    }

    // Validate custom CSS (basic check)
    if (config.customCss && typeof config.customCss !== 'string') {
      throw new Error('Custom CSS must be a string');
    }

    // Validate section title
    if (config.sectionTitle && typeof config.sectionTitle !== 'string') {
      throw new Error('Section title must be a string');
    }

    // Validate no posts message
    if (config.noPostsMessage && typeof config.noPostsMessage !== 'string') {
      throw new Error('No posts message must be a string');
    }

    // Validate target branch
    if (config.targetBranch) {
      this.validateBranchName(config.targetBranch);
    }
  }

  /**
   * Validate numeric configuration option
   * @param {string} optionName - Name of the option
   * @param {number} value - Value to validate
   * @param {number} min - Minimum allowed value
   * @param {number} max - Maximum allowed value
   * @throws {Error} If value is invalid
   */
  validateNumericOption(optionName, value, min, max) {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`${optionName} must be a valid number`);
    }

    if (!Number.isInteger(value)) {
      throw new Error(`${optionName} must be an integer`);
    }

    if (value < min || value > max) {
      throw new Error(`${optionName} must be between ${min} and ${max}`);
    }
  }

  /**
   * Validate Git branch name
   * @param {string} branchName - Branch name to validate
   * @throws {Error} If branch name is invalid
   */
  validateBranchName(branchName) {
    if (!branchName || typeof branchName !== 'string') {
      throw new Error('Branch name must be a string');
    }

    if (branchName.trim().length === 0) {
      throw new Error('Branch name cannot be empty');
    }

    // Git branch name validation rules
    const invalidPatterns = [
      /^\./, // Cannot start with dot
      /\.$/, // Cannot end with dot
      /\.\./, // Cannot contain consecutive dots
      /\s/, // Cannot contain spaces
      /[~^:?*\[\]\\]/ // Cannot contain special chars
    ];

    for (const pattern of invalidPatterns) {
      if (pattern.test(branchName)) {
        throw new Error(`Invalid branch name: ${branchName}`);
      }
    }

    if (branchName.length > 250) {
      throw new Error('Branch name is too long (max 250 characters)');
    }
  }

  /**
   * Validate GitHub token (basic check)
   * @param {string} token - GitHub token
   * @throws {Error} If token is invalid
   */
  validateGitHubToken(token) {
    if (!token || typeof token !== 'string') {
      throw new Error('GitHub token is required and must be a string');
    }

    if (token.trim().length === 0) {
      throw new Error('GitHub token cannot be empty');
    }

    // Basic token format validation
    if (token.length < 10) {
      throw new Error('GitHub token appears to be too short');
    }
  }
}

module.exports = { ValidationHelper };
