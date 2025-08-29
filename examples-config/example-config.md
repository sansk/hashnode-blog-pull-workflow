# Usage

Choose the configuration that best suits your needs and paste it into '.github/workflows/hasnode-blog-post-workflow.yml`

Replace `my-awesome-blog` with your actual Hashnode publication name in the workflow file.

Example,

- Enter `my-awesome-blog` if you use hashnode hsoted blog like `my-awesome-blog.hashnode.dev`
- Enter your custom domain, if you have - `blog.my-awesome-blog.com` or `my-awesome-blog.com`

## Basic Usage (Runs with default configuration)

```yaml
name: Update README with Hashnode Blog post.
description: This workflow updates the README with latest Blog post fetched from hashnode.

# Run this workflow automatically
on:
  schedule: # Run every day at 6 AM UTC
    - cron: '0 6 * * *'
  workflow_dispatch: # Allow manual triggering of the workflow

# Add proper permissions
permissions:
  contents: write # Needed to create/update files

jobs:
  update-readme-with-blog-post:
    runs-on: ubuntu-latest
    name: Update Blog posts from hashnode in README

    steps:
      - name: Checkout repository
        uses: actions/checkout@v5
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Update README with latest Blog posts from Hashnode
        uses: sansk/hashnode-blog-pull-workflow@v1
        with:
          with:
            publication_name: 'my-awesome-blog' # Replace with your Hashnode publication name
```

### Advanced Configuration

```yaml
name: Update README with Hashnode Blog post.
description: This workflow updates the README with latest Blog post fetched from hashnode.

# Run this workflow automatically
on:
  schedule: # Run every day at 6 AM UTC
    - cron: '0 6 * * *'
  workflow_dispatch: # Allow manual triggering of the workflow

# Add proper permissions
permissions:
  contents: write # Needed to create/update files

jobs:
  update-readme-with-blog-post:
    runs-on: ubuntu-latest
    name: Update Blog posts from hashnode in README

    steps:
      - name: Checkout repository
        uses: actions/checkout@v5
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Update README with latest Blog posts from Hashnode
        uses: sansk/hashnode-blog-pull-workflow@v1
        with:
          publication_name: 'my-awesome-blog'
          post_count: 8
          display_format: 'card'
          image_width: 150
          image_height: 100
          date_format: 'MMMM Do, YYYY'
          description_length: 150
          section_title: '🔥 My Latest Articles'
          custom_css: 'box-shadow: 0 2px 4px rgba(0,0,0,0.1);'
          filename: 'BLOG.md'
```

### Multiple Files

You can update multiple files by running the action multiple times:

```yaml
name: Update README with Hashnode Blog post.
description: This workflow updates the README with latest Blog post fetched from hashnode.

# Run this workflow automatically
on:
  schedule: # Run every day at 6 AM UTC
    - cron: '0 6 * * *'
  workflow_dispatch: # Allow manual triggering of the workflow

# Add proper permissions
permissions:
  contents: write # Needed to create/update files

jobs:
  update-readme-with-blog-post:
    runs-on: ubuntu-latest
    name: Update Blog posts from hashnode in README

    steps:
      - name: Checkout repository
        uses: actions/checkout@v5
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Update README with latest Blog posts from Hashnode
        uses: sansk/hashnode-blog-pull-workflow@v1
        with:
          publication_name: 'my-blog'
          post_count: 6
          display_format: 'stacked-left'
          filename: 'README.md'

      - name: Update Blog Page
        uses: sansk/hashnode-blog-pull-workflow@v1
        with:
          publication_name: 'my-blog'
          post_count: 12
          display_format: 'table'
          filename: 'BLOG.md'
```
