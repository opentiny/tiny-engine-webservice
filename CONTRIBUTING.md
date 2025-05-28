# Contributing
We are glad that you are willing to contribute to the TinyEngine open source project. There are many forms of contribution. You can choose one or more of them based on your strengths and interests:

* Report new defect.
* Provide more detailed information for the existing defects, such as supplementary screenshots, more detailed reproduction steps, minimum reproducible demo links, etc.
* Submit Pull requests to fix typos in the document or make the document clearer and better.
* Add the official assistant WeChat opentiny-official and join the technical exchange group to participate in the discussion.

When you personally use the TinyEngine and participate in many of the above contributions, as you become familiar with TinyEngine , you can try to do something more challenging, such as:

* Fix the defect. You can start with Good-first issue.
* Implementation of new features
* Complete unit tests.
* Translate documents
* Participate in code review.

### Bug Reports
If you encounter problems when using TinyEngine-webservice, please submit an issue to us. Before submitting an issue, read the related official documents carefully to check whether the issue is a defect or a function that has not been implemented.

If the issue is a defect, select the bug report template when creating a new issue. The title must comply with the defect description format. For example, [TinyEngine-webservice] cannot be refreshed.

To report a defect, you need to fill in the following information:

* TinyEngine-webservice and node version numbers
*Screenshots can be used to describe the defect. If an error is reported, the error information can be posted.
* It is recommended that a minimum demo link be provided to reproduce the defect.

If the feature is a new feature, select the Feature request template. The title complies with the format of the new feature description, for example, [TinyEngine-webservice].

For an issue of a new feature, you need to fill in the following information:

* What problems does this feature solve
* What is the API of this feature

### Pull Requests

Before submitting pull request, please make sure that your submission is in line with the overall plan of TinyEngine-webservice. Generally, issues that marked as bug are encouraged to submit pull requests. If you are not sure, you can create a Discussion for discussion.

Local startup steps:

* Click Fork in the upper right corner of the tiny-engine-webservice code repository to fork the upstream repository to the personal repository.
* Clone personal warehouse to local
* Run npm install in the tiny-engine-webservice root directory to install the dependency.
* Modify related configurations in the config folder in the tiny-engine-webservice root directory.
* Run npm run dev in the root directory of tiny-engine-webservice to start local development.

```
# username indicates the user name. Replace it before running the command.
git clone git@github.com:username/tiny-engine-webservice.git
cd tiny-engine-webservice
git remote add upstream git@github.com:opentiny/tiny-engine-webservice.git
npm i

# Start the project.
$ npm run dev
```
To submit a PR:

* Create a new branch git checkout -b username/feature1. The name of the branch should be username/feat-xxx / username/fix-xxx.
* Local coding.
* Submit according to Commit Message Format specification. PR that do not conform to the submission specification will not be merged.
* Submit to remote repository: git push origin branchName.
* (Optional) Synchronize upstream repository dev branch latest code: git pull upstream dev.
* Open the Pull requests link of the TinyEngine-webservice code repository and click the New pull request button to submit the PR.
* Project Committer conducts Code Review and makes comments.
* The PR author adjusts the code according to the opinion. Please note that when a branch initiates PR, the subsequent commit will be synchronized automatically, and there is no need to resubmit the PR.
* Project administrator merges PR.

The contribution process is over, thank you for your contribution!

### Join the open source community
If you are interested in our open source projects, please join our open source community in the following ways.

* Add the official assistant WeChat: opentiny-official, join our technical exchange group
* Join the mailing list: opentiny@googlegroups.com