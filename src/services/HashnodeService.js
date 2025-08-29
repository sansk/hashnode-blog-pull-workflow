const { create } = require('axios');
const { Logger } = require('../helpers/Logger');
const { DateHelper } = require('../helpers/DateHelper');

/**
 * Service for interacting with Hashnode API
 */
class HashnodeService {
  constructor() {
    this.logger = new Logger();
    this.apiUrl = 'https://gql.hashnode.com/';
    this.client = create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Hashnode-Blog-Pull-Action/1.0.0'
      },
      timeout: 30000
    });
  }

  /**
   * Fetch blog posts from Hashnode publication
   * @param {string} publicationName - Hashnode publication name
   * @param {number} postCount - Number of posts to fetch
   * @returns {Array} Array of blog post objects
   */
  async fetchBlogPosts(publicationName, postCount) {
    try {
      const query = this.buildGraphQLQuery(publicationName, postCount);

      this.logger.debug('GraphQL Query:', query);

      const response = await this.client.post('', {
        query,
        variables: {
          host: publicationName,
          first: postCount
        }
      });

      if (response.data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(response.data.errors)}`);
      }

      const publication = response.data.data?.publication;

      if (!publication) {
        throw new Error(`Publication '${publicationName}' not found`);
      }

      const posts = publication.posts?.edges || [];

      return posts.map(edge => this.transformPost(edge.node));
    } catch (error) {
      if (error.response) {
        this.logger.error('API Response Error:', {
          status: error.response.status,
          data: error.response.data
        });
        throw new Error(
          `Hashnode API error: ${error.response.status} - ${error.response.statusText}`
        );
      } else if (error.request) {
        this.logger.error('Network Error:', error.message);
        throw new Error('Network error: Unable to reach Hashnode API');
      } else {
        this.logger.error('Error:', error.message);
        throw error;
      }
    }
  }

  /**
   * Build GraphQL query for fetching blog posts
   * @param {string} publicationName - Publication name
   * @param {number} postCount - Number of posts to fetch
   * @returns {string} GraphQL query string
   */
  buildGraphQLQuery(publicationName, postCount) {
    return `
      query GetPublicationPosts($host: String!, $first: Int!) {
        publication(host: $host) {
          id
          title
          posts(first: $first) {
            edges {
              node {
                id
                title
                brief
                slug
                url
                publishedAt
                coverImage {
                  url
                }
                author {
                  name
                  username
                }
                tags {
                  name
                  slug
                }
                readTimeInMinutes
              }
            }
          }
        }
      }
    `;
  }

  /**
   * Transform raw post data from Hashnode API
   * @param {Object} post - Raw post data from API
   * @returns {Object} Transformed post object
   */
  transformPost(post) {
    return {
      id: post.id,
      title: post.title || 'Untitled',
      description: post.brief || '',
      slug: post.slug,
      url: post.url,
      publishedAt: post.publishedAt,
      formattedDate: DateHelper.formatDate(post.publishedAt),
      coverImage: post.coverImage?.url || '',
      author: {
        name: post.author?.name || 'Unknown Author',
        username: post.author?.username || ''
      },
      tags: post.tags || [],
      readTime: post.readTimeInMinutes || 0
    };
  }
}

module.exports = { HashnodeService };
