# Template Library

This is a template for any subsequent TypeScript library that Rumbleship will create.

## Getting Going:

- Fork this repo.
- Ensure the Rumbleship Organization owns the new repo.

  - Update package name to be `@rumbleship/new-libary-name.`

- Automated building via Circle:
  - `./.circleci/config.yml`:
    - sed `/template-library` for `new-library-name`
    - Add whatever new build rules, setup, etc are needed (optional)
  - Enabling building [https://circleci.com/add-projects/gh/Rumbleship](https://circleci.com/add-projects/gh/Rumbleship.).
    - Click "Set Up Project"
    - Click "Start Building" (all configuration expected is already present)
  - Ensure Circle has the Rumbleship Ops User SSH key
    - https://circleci.com/gh/Rumbleship/{{new-repo-name}}/edit#ssh
    - Copy key from `sextant/vault/ssh/rumbleship-ops.key`
    - Add it twice, once with host `github.com`, and once with a blank host
