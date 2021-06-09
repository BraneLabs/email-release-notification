# E-mail Release Notification

This repo contains a re-usable GitHub Action that when installed sends an e-mail to a distribution list with the release notes every time a GitHub Release is created for the repository.

This Action makes use of [Mailgun's](https://mailgun.com/) API to send the e-mails.

## Pre-Requisites

To run this action you'll need:
- A [**Mailgun API Key**](https://help.mailgun.com/hc/en-us/articles/203380100-Where-Can-I-Find-My-API-Key-and-SMTP-Credentials-).
- **A text file hosted anywhere** with the list of e-mail recipients. _You can use [GitHub Gists](https://gist.github.com) and get the link of the raw file._

## Setup

### 1. Create the workflow

Add a new YML file workflow in `.github/workflows` to trigger on `release`. For example:
```yml
name: E-Mail Release Notification
on:
  release:
    types: [published]
jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
    - name: Notify about a new release
      uses: BraneLabs/email-release-notification@v3.0.0
      env:
        MAILGUN_API_TOKEN: ${{ secrets.MAILGUN_API_TOKEN }}
        RELEASE_RECIPIENTS_URL: ${{ secrets.RELEASE_RECIPIENTS_URL }}
        RELEASE_SENDER_EMAIL: ${{ secrets.RELEASE_SENDER_EMAIL }}
        RELEASE_DISTRIBUTION_LISTS: ${{ secrets.RELEASE_DISTRIBUTION_LISTS }}
        MAILGUN_EMAIL_DOMAIN: ${{ secrets.MAILGUN_EMAIL_DOMAIN }}
```

### 2. Set all the described secrets on the env section of the yaml file

Create a new secret on your project named `MAILGUN_API_TOKEN`. Set the value to your


### 3. Set the RECIPIENTS_URL secret

Do the same for a secret named `RECIPIENTS_URL` that you need to set to the URI of the text file with the target recipients. The contents of the file should be a list of e-mails separated by newlines, for example:

```
user@example.com
list@example.com
```

If you don't know where to host this file, just go to [GitHub Gists](https://gist.github.com) and create a new textfile with the e-mails you want to target. After you save the file just click `raw` and get the URI of the file you've just created.
