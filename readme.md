# Social Media

This project is a Social Media platform, It's made for live private/group chat & Video/Audio Call, project allow to share stories. Socket.io/WebSocket used for live chat , WebRTC / PeerJs (for peer 2 peer) used for live Video/Audio Calls.

## Features

- Pwa
- Google Login & Sign up
- Friends Logic (If you message each other)
- Live Chat Private/Group
- Live Call Video/Audio
- User Online/Offline/Typing Status
- Unreaded Messages Count
- File Share (Audio, Video, Image )
- Create/Edit/Delete Group
- Admin can add members to the group if they are friends
- Share Stories
- Stories Video Controls - AutoPlay/SeekBar/When Click On Video if paused it will play or not it will pause
- Search for Users (name search for friends, global id/number search)
- Search for Group (only for joined groups)
- Account Edit Option
- Messages Copy/Delete/Delete Entire Chat Options
- Light & Dark mode
- Responsive Design

## Prerequisites

Make sure you have installed all of the following prerequisites on your development machine:

- Node Js & Npm [Download and Install](https://nodejs.org/en)
- MongoDB [Download and Install](https://www.mongodb.com/docs/manual/installation/)
- Git [Download and Install](https://git-scm.com/downloads)

## Technology Used

#socket.io #websocket #webrtc #peerjs

#vite #reactjs #scss #redux-toolkit

#nodejs #expressjs #mongodb #jsonwebtoken authentication

#javascript

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file in server directory

`PORT` = `5000`

`DB_URL`

`JWT_SECRET`

`MAIL_EMAIL`

`MAIL_SECRET`

To run this project, you will need to add the following environment variables to your .env.local file in client directory

`VITE_GOOGLE_CLIENT` #Google login api client id

`BACK_END` = `http://localhost:5000` #back end url for work api

## Run Locally

Clone the project

```bash
  git clone https://github.com/ansonbenny/Social-Media
```

##To Start BackEnd

Go to the server directory

```bash
  cd Social-Media/server
```

Install dependencies

```bash
  npm install
```

Start

```bash
  npm start
```

##To Start FrontEnd

Go to the client directory

```bash
  cd Social-Media/client
```

Install dependencies

```bash
  npm install
```

Start

```bash
  npm run dev
```

## Demo

[Live](https://softchat.online/)

## 🔗 Links

[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/anson-benny/)
