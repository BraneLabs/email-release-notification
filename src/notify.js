const fs           = require('fs');
const axios        = require('axios');
const showdown     = require('showdown');
const Mailgun      = require('mailgun-js');

async function prepareMessage(recipients, lists) {
  const { repository, release } = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));

  const converter = new showdown.Converter({simpleLineBreaks: true});
  const repoName = repository.name;
  const repoURL = repository.html_url;
  const repoDescription = repository.description ? `, ${repository.description.charAt(0).toLowerCase()+repository.description.slice(1)}` : '';
  const releaseVersion = release.tag_name;
  const releaseRegex = process.env.RELEASE_REGEX;
  const releaseName = release.name;
  const releaseURL = release.html_url;
  const ownerResponse = await axios.get(repository.owner.url);

  // Templates
  const subject = `[GitHub] ${repoName} ${releaseVersion} [${releaseName}] released!`;
  const footer = `\n\nRegards,\n\nThe Engineering team`;
  const header = `[${repoName}](${repoURL})${repoDescription} reached it's [${releaseVersion}](${releaseURL}) version.`;

  const releaseBody = converter.makeHtml(`${header}\n\n${release.body}${footer}`);

  const sender = process.env.RELEASE_SENDER_EMAIL;

  console.log("Regex: " + releaseRegex);
  console.log("ReleaseVersion: " + releaseVersion);
  if (releaseRegex != null) {
    console.log("Match?: " + new RegExp(releaseRegex).test(releaseVersion));
  }

  if (releaseRegex == null || new RegExp(releaseRegex).test(releaseVersion)) {
    return {
      from: sender,
      to: recipients,
      bcc: lists,
      subject: subject,
      html: releaseBody,
    };
  } else {
    return false;
  }
}

async function run(recipientsUrl, distributionLists) {
  const { data } = await axios.get(recipientsUrl);
  const recipients = data.split(/\r\n|\n|\r/);
  const lists = distributionLists ? distributionLists.split(',') : [];

  const mailgun = new Mailgun({apiKey: process.env.MAILGUN_API_TOKEN, domain: process.env.MAILGUN_EMAIL_DOMAIN});

  const message = await prepareMessage(recipients, lists);
  if(message != false) {
    await mailgun.messages().send(message, function (err, body) {
          if (err) {
              console.error(err);
          }
          else {
              console.log("Sent!")
              console.log(body);
              console.log(message);
          }
      });
  }
}

/**
 * Run
 */
run(process.env.RELEASE_RECIPIENTS_URL, process.env.RELEASE_DISTRIBUTION_LISTS)
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
