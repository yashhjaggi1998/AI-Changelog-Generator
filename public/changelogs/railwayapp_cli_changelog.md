# Changelog for New Release

## 🚀 Features and Improvements

- **Manual Docker Deployment Enhancements**:
  - Adjusted the manual docker deployment tag formatting to ensure tags do not have a `v*` prefix.

- **Improved CI Tag Handling**:
  - Resolved an issue with tag order by replacing the API request with a "tag" input field, allowing the push of any tag as the latest.

- **Docker CI Workflow Fixes**:
  - Reverted the restriction to only run the publish workflow on changes to the master branch.
  - Introduced a manual job trigger to enable flexibility in workflow execution, addressing previously encountered issues with trigger logic.

