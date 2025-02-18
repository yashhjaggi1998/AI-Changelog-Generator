## MVP Overview

### Note: Currently we only support public repositories: 
1. To avoid redundancy: greptile already has a Github Auth system developed which can be extended for private repos in this project.

### Architecture
![Changelog Generator Architecture](https://github.com/user-attachments/assets/9656ea85-60be-4ce0-94e7-83a2b3469fca)

### Current logic
- Fetch the latest realese: I fetch the latest release and it's date of release. This is a dependable approach since
  - If we have a latest release point that acts as the checkpoint. We fetch all the PR's merged after this checkpoint date (merged is important since some PR's can be opened before the release) and their corresponding commit history. We use this data to generate changelog.
  - If we don't have any release we fetch all the merged PR's and their commit history. We use this data to generate Changelog.

### Product/Technical Decisions:
1. Using a stepper functionality, to show a logical separation yet continuous flow.
2. Provide real-time updates for the user.
3. Fail gracefully if any step throws and error, inform the user and stop the changelog generation process.
4. Users with the changelog view link should only view and not be able to trigger a changelog release.
5. Idea is to render out the changelog in markdown (.md) format for the ease of use and better user experience. Not every user is familiar with .md, so we go that extra step to help them.
6. Using OpenAI as the LLM for response generation with zero-shot prompting. Since, this is simply an MVP.
    - More viable approach will be to fine-tune given the resources, relevant data and time for it.
    - If OpenAI is costly, then we can use open-source models as an alternative and design more efficient prompts.
    - Based on my experience, chain-of-thought + few-shot-prompting works well in these situations. The limitation is that it will get costly in terms of number of tokens.
7. Keep the color pallette simple and avoid any major color dump. Tried to stick to monchromatic theme as much as possible.
8. The commit history to be used for generating changelog can have multiple options:
    - Use entire commit history from start: Not useful since redundant features will be incorporated.
    - Ask user for a specific date point. But latest release is a logical start point. Dpeending if users prefer more choices this option can be added.
    - Use PR file diffs and comments but I am skipping because of token limitations. I am open to this option once MVP is built out.
9. No use developing Github OAuth since the module is already developed. Let's avoid redundancy in development.

### Future Scope:
1. Things left out of scope: pagination and number of results to get from Github API.
2. Use commit comments and file diff to get better context for response generation.
3. Add access mangement for different users.
4. Build a custom CLI tool for users using CLI since a huge chunk use Git CLI for their version-control related tasks.

## Local development

1. Clone the repo.
2. Run the development server:
```bash
npm run dev
```
3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
4. You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
