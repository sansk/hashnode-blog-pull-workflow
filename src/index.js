const { setFailed } = require('@actions/core');
const { BlogController } = require('./controllers/BlogController');
const { Logger } = require('./helpers/Logger');

/**
 * Main entry point for the GitHub Action
 */
async function run() {
  const logger = new Logger();

  try {
    logger.info('Starting Hashnode Blog Pull Action...');

    const blogController = new BlogController();
    await blogController.execute();

    logger.info('Action completed successfully!');
  } catch (error) {
    logger.error('Action failed:', error);
    setFailed(error.message);
  }
}

// Execute the action
if (require.main === module) {
  run();
}

module.exports = { run };
