# Traktor Metadata API Server

An easy way to get track id from Traktor in a JSON format.

This electron app runs a tiny express server, which used in combination with https://github.com/ErikMinekus/traktor-api-client lets you access the current track info at http://localhost:8080/api

## Usage

### Step 1:
Follow the instructions on https://github.com/ErikMinekus/traktor-api-client to install the modified D2 controller. This will create a client within traktor that sends data to the endpoints.

### Step 2:
Clone the repository, run `npm install` and then use `npm run start-desktop` to run the electron app (or `npm run start` to just run as a local webserver)

### Step 3:
You should see your track IDs and info appear at http://localhost:8080/api

## Notes

This is a very hacky project put together to get something done, and is not maintained. Feel free to contribute if you think there's a better way of doing things!