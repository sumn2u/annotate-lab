
# Contributing to Annotation-Lab

Thank you for considering contributing to Annotation-Lab! We welcome contributions from the community to help improve and enhance the project. To ensure a smooth collaboration, please follow the guidelines outlined in this document.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
  - [Client Setup](#client-setup)
  - [Server Setup](#server-setup)
- [Style Guides](#style-guides)
  - [Commit Messages](#commit-messages)
  - [Code Style](#code-style)
- [License](#license)

## Code of Conduct

Please read and adhere to our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a welcoming and respectful environment for all contributors.

## How Can I Contribute?

### Reporting Bugs

If you encounter any bugs, please help us by reporting them:

1. Ensure the bug has not already been reported by searching existing issues.
2. Open a new issue with the following information:
   - A clear and descriptive title.
   - Steps to reproduce the bug.
   - Expected and actual behavior.
   - Screenshots or code snippets (if applicable).
   - Any other relevant information.

### Suggesting Enhancements

We welcome suggestions for new features or improvements:

1. Search existing issues to check if the enhancement has already been suggested.
2. Open a new issue with the following information:
   - A clear and descriptive title.
   - A detailed description of the proposed enhancement.
   - Any relevant examples or mockups.

### Pull Requests

To contribute code changes, follow these steps:

1. Fork the repository.
2. Create a new branch for your changes:
   ```sh
   git checkout -b feature/your-feature-name
   ```
3. Make your changes.
4. Commit your changes with a descriptive commit message.
5. Push your branch to your forked repository:
   ```sh
   git push origin feature/your-feature-name
   ```
6. Open a pull request to the main repository with a clear description of your changes.

## Development Setup

To set up the development environment, follow these steps:

### Client Setup

1. Navigate to the `client` directory:
   ```sh
   cd client
   ```
2. Install the dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm start
   ```

### Server Setup

1. Navigate to the `server` directory:
   ```sh
   cd server
   ```
2. Create and activate a virtual environment:
   ```sh
   python3 -m venv venv
   source venv/bin/activate  # On Windows use \`venv\\Scripts\\activate\`
   ```
3. Install the dependencies:
   ```sh
   pip install -r requirements.txt
   ```
4. Start the Flask server:
   ```sh
   flask run
   ```

## Style Guides

### Commit Messages

- Use clear and descriptive commit messages.
- Follow the format:
  ```
  type: subject

  body (optional)
  ```
  Example:
  ```
  feat: add image upload functionality

  Added the ability for users to upload images from their local machine.
  ```

### Code Style

- Follow the coding style of the existing codebase.
- Ensure your code is well-documented.
- Run linters and formatters before submitting a pull request.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

Thank you for your contributions! If you have any questions, feel free to open an issue or contact the project maintainers.
"""

