# ofisim-ik-reporter-bot
[![Build Status](https://travis-ci.com/Semyonic/ik-ofisim-reporter-bot.svg?branch=master)](https://travis-ci.com/Semyonic/ik-ofisim-reporter-bot)
![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/semyonic/ik-ofisim-bot.svg)

My solution to Etiya's daily routine.

> Checks current day report status. If no report exists in current day then creates the record.
When day reaches Friday, automatically sends approval request to the team lead.

## Why ?
I love AUTOMATING THINGS (Retardic or Not)

## Pre-Installation

1. Open your favorite Web Browsers Console (Right click->Inspect or Press F12)
2. Navigate to the **Network** tab.
3. Navigate to [ik.ofisim.com](https://ik.ofisim.com/#/app/crm/timetracker)
4. Login to [ik.ofisim.com](https://ik.ofisim.com/#/app/crm/timetracker)
5. Select any request.
6. Look for **Headers** and copy **Authorization** header after **Bearer** text
7. Paste this token into your **.env** file

## Installation

```sh
$ yarn
```

Then configure your **.env** file (Sample .env exists in this project)

## Configuration

You can change polling frequency in **.env** file

### ****<center>.env Configuration Parameters</center>****

| Name | Description |
| --- | --- |
| `TOKEN` | Your bot ofisim.ik Authorization Token |
| `USER_AGENT` | Your bot's user agent |
| `OWNER` | Your *ofisim.ik* user identification number (Bot automatically gets this on init phase)|
| `TIME_COUNT` | Daily working hour count. Default:9 (No need for change)|
| `KITLE` | Don't know it's purpose but it's required (Don't touch it)|
| `DEPARTMENT` | Your department at Etiya. 695 (Çözüm Geliştirme)|
| `PROJECT` | Your current team at Etiya. 80 (Videotron Marvel)|
| `DESC` | Daily report description.|
| `REPORT_CHECK_INTERVAL` | Daily report checker and creator interval. Default:5 hours in miliseconds|
| `TIMETRACKER_ID` | Report ID. (Don't touch it ! Automatically fetches from endpoint)|

## Pro Tip

Use it in a Serverless environment!

## Usage

```bash
yarn start
```
OR
```bash
docker pull semyonic/ik-ofisim-bot
docker run -p 3000:3000/tcp semyonic/ik-ofisim-bot
```

## Management

| EndPoint | Method |Description |
| --- | --- | --- |
| `/start` | GET | Starts the bot |
| `/info` | GET | Gets information about current status, week, month, etc..|
| `/kill` | POST | Kills the bot (Only interval. Instance won't be affected)|

## Questions

Visit me at **Level -1 Office**
 
or

[Mail Me](<mailto:semih.onay@etiya.com?subject=About Reporter Bot>)

## License
Use and spread it with my **Name** !

MIT © [Semih Onay](https://semihonay.tk)
