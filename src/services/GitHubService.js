const { getOctokit } = require('@actions/github');
const { getInput } = require('@actions/core');
const { Logger } = require('../helpers/Logger');
const fs = require('fs').promises;
const path = require('path');

/**
 * Service for interacting with GitHub API
 */
class GitHubService {
  constructor() {
    this.logger = new Logger();
    this.token = getInput('github_token') || process.env.GITHUB_TOKEN;

    // For local development, allow placeholder tokens
    if (!this.token || this.token === 'ghp_placeholder_token_for_local_testing') {
      this.logger.warn(
        'Using placeholder GitHub token - GitHub operations will be mocked for local development'
      );
      this.isMockMode = true;
      this.mockResponses = {
        fileContent: '',
        commitSha: 'mock-commit-sha-' + Date.now()
      };
      return;
    }

    this.octokit = getOctokit(this.token);

    // Get repository information from environment
    const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/');
    this.owner = owner;
    this.repo = repo;

    if (!this.owner || !this.repo) {
      throw new Error(
        'Unable to determine repository owner and name from GITHUB_REPOSITORY environment variable'
      );
    }
  }

  /**
   * Get file content from repository
   * @param {string} path - File path in repository
   * @returns {string} File content
   */
  async getFileContent(filePath) {
    try {
      // Mock mode for local development - read from local filesystem
      if (this.isMockMode) {
        try {
          const fullPath = path.resolve(process.cwd(), filePath);
          this.logger.debug(`Mock: Reading local file: ${fullPath}`);
          const content = await fs.readFile(fullPath, 'utf8');
          this.logger.debug(
            `Mock: Successfully read ${content.length} characters from ${filePath}`
          );
          return content;
        } catch (error) {
          if (error.code === 'ENOENT') {
            this.logger.info(`Mock: File ${filePath} not found locally, will create new file`);
            return '';
          }
          this.logger.error('Mock: Error reading local file:', error.message);
          throw error;
        }
      }

      this.logger.debug(`Fetching file content: ${filePath}`);

      const response = await this.octokit.rest.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: filePath,
        ref: getInput('target_branch') || 'main'
      });

      if (response.data.type !== 'file') {
        throw new Error(`Path ${filePath} is not a file`);
      }

      // Decode base64 content
      const content = Buffer.from(response.data.content, 'base64').toString('utf8');
      this.logger.debug(`Successfully fetched file content (${content.length} characters)`);

      return content;
    } catch (error) {
      if (error.status === 404) {
        this.logger.info(`File ${filePath} not found, will create new file`);
        return '';
      }

      this.logger.error('Error fetching file content:', error.message);
      throw new Error(`Failed to fetch file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Update file in repository
   * @param {string} path - File path in repository
   * @param {string} content - New file content
   * @param {string} message - Commit message
   * @returns {string} Commit SHA
   */
  async updateFile(filePath, content, message) {
    try {
      // Mock mode for local development - write to local filesystem
      if (this.isMockMode) {
        try {
          const fullPath = path.resolve(process.cwd(), filePath);
          // Ensure directory exists
          const dir = path.dirname(fullPath);
          await fs.mkdir(dir, { recursive: true });

          await fs.writeFile(fullPath, content, 'utf8');
          this.logger.info(
            `Mock: Successfully wrote ${content.length} characters to local file ${filePath}`
          );
          return this.mockResponses.commitSha;
        } catch (error) {
          this.logger.error('Mock: Error writing local file:', error.message);
          throw error;
        }
      }

      this.logger.debug(`Updating file: ${filePath}`);

      // Get current file SHA if it exists
      let sha;
      try {
        const currentFile = await this.octokit.rest.repos.getContent({
          owner: this.owner,
          repo: this.repo,
          path: filePath,
          ref: getInput('target_branch') || 'main'
        });
        sha = currentFile.data.sha;
      } catch (error) {
        if (error.status !== 404) {
          throw error;
        }
        // File doesn't exist, no SHA needed
      }

      // Update or create file
      const response = await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path: filePath,
        message: message,
        content: Buffer.from(content).toString('base64'),
        sha: sha,
        branch: getInput('target_branch') || 'main'
      });

      this.logger.info(`Successfully updated file ${filePath} (SHA: ${response.data.commit.sha})`);
      return response.data.commit.sha;
    } catch (error) {
      this.logger.error('Error updating file:', error.message);
      throw new Error(`Failed to update file ${filePath}: ${error.message}`);
    }
  }
}

module.exports = { GitHubService };
