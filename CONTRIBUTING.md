# Contributing

1.  Update local main branch:

        $ git checkout main
        $ git pull upstream main

2.  Create feature branch:

        $ git checkout -b feature-x

3.  Make one or more atomic commits, and ensure that each commit has a
    descriptive commit message. Commit messages should be line wrapped
    at 72 characters.

4.  Run `npm test`, and address any errors. Preferably, fix commits in place
    using `git rebase` or `git commit --amend` to make the changes easier to
    review.

5.  Push:

        $ git push origin feature-x

6.  Open a pull request.
