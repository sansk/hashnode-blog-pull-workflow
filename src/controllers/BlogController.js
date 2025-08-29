const { setOutput } = require('@actions/core');
const { HashnodeService } = require('../services/HashnodeService');
const { GitHubService } = require('../services/GitHubService');
const { TemplateService } = require('../services/TemplateService');
const { ValidationHelper } = require('../helpers/ValidationHelper');
const { ConfigHelper } = require('../helpers/ConfigHelper');
const { Logger } = require('../helpers/Logger');

/**
 * Main controller for blog operations
 */
class BlogController {
  constructor() {
    this.logger = new Logger();
    this.config = ConfigHelper.getConfig();
    this.hashnodeService = new HashnodeService();
    this.githubService = new GitHubService();
    this.templateService = new TemplateService();
    this.validationHelper = new ValidationHelper();
  }

  /**
   * Execute the main blog pull and deploy process
   */
  async execute() {
    try {
      // Validate inputs
      this.logger.info('Validating inputs...');
      this.validationHelper.validateInputs(this.config);

      // Fetch blog posts from Hashnode
      this.logger.info(
        `Fetching ${this.config.postCount} posts from Hashnode publication: ${this.config.publicationName}`
      );
      const posts = await this.hashnodeService.fetchBlogPosts(
        this.config.publicationName,
        this.config.postCount
      );

      if (!posts || posts.length === 0) {
        this.logger.warn('No blog posts found');
        setOutput('posts_count', 0);
        setOutput('file_updated', false);
        return;
      }

      this.logger.info(`Found ${posts.length} blog posts`);

      // Generate content based on display format
      this.logger.info(`Generating content with format: ${this.config.displayFormat}`);
      const content = this.templateService.generateContent(posts, this.config);

      // Read current file content
      this.logger.info(`Reading file: ${this.config.filename}`);
      const currentContent = await this.githubService.getFileContent(this.config.filename);

      // Update file with new content
      this.logger.info('Updating file with new content...');
      const updatedContent = this.updateFileContent(currentContent, content);

      // Check if content actually changed
      if (currentContent === updatedContent) {
        this.logger.info('No changes detected in file content');
        setOutput('posts_count', posts.length);
        setOutput('file_updated', false);
        return;
      }

      // Commit changes to repository
      this.logger.info('Committing changes to repository...');
      const commitSha = await this.githubService.updateFile(
        this.config.filename,
        updatedContent,
        `Update blog posts (${posts.length} posts)`
      );

      // Set outputs
      setOutput('posts_count', posts.length);
      setOutput('file_updated', true);
      setOutput('commit_sha', commitSha);

      this.logger.info(
        `Successfully updated ${this.config.filename} with ${posts.length} blog posts`
      );
    } catch (error) {
      this.logger.error('Error in BlogController execution:', error);
      throw error;
    }
  }

  /**
   * Update file content with new blog posts section
   * @param {string} currentContent - Current file content
   * @param {string} newContent - New blog posts content
   * @returns {string} Updated file content
   */
  updateFileContent(currentContent, newContent) {
    const sectionStart = `<!-- BLOG-POSTS:START -->`;
    const sectionEnd = `<!-- BLOG-POSTS:END -->`;

    const fullSection = `${sectionStart}\n${this.config.sectionTitle ? `## ${this.config.sectionTitle}\n\n` : ''}${newContent}\n${sectionEnd}`;

    // If markers exist, replace content between them
    if (currentContent.includes(sectionStart) && currentContent.includes(sectionEnd)) {
      const beforeSection = currentContent.substring(0, currentContent.indexOf(sectionStart));
      const afterSection = currentContent.substring(
        currentContent.indexOf(sectionEnd) + sectionEnd.length
      );
      return beforeSection + fullSection + afterSection;
    }

    // If no markers exist, append to end of file
    return currentContent + '\n\n' + fullSection + '\n';
  }
}

module.exports = { BlogController };
