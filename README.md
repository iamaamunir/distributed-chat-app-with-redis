# Distributed Real-Time Chat App

A lightweight, real-time chat application built with Socket.IO, Express, and Vanilla JavaScript. This will be scaled in the future using Redis and a Load Balancer.

## Features (MVP)

- Real-time messaging between users

- Room-based chats (users can join mtltiple rooms)

- Simple frontend for message exchange

- Server emits system messages for join events

- Users can join by username and room

## Tech Stack

- Frontend: HTML,CSS,JS
- Real-time: Socket.IO
- Server: Node.js, Express
  
## Architecttre Overview
![System Architecture](/images/chat_app.drawio.png "Diagram showing design flow")

- Client connects to the server and prompts for username and room.
- Socket.IO server:
  - Accepts connections
  - Joins rooms
  - Broadcasts messages to other clients in the same room
  - Emits system events like "user joined"

## How to Run
1. Clone the repo
   ```sh
   git clone https://github.com/iamaamunir/distributed-chat-app-with-redis

   cd distributed-chat-app-with-redis
   ```


2. Install NPM packages
   ```sh
   npm install
   ```

3. Set up .env
    ```sh
   PORT=5000
   ```
4. Start the server
    ```sh
    node server/index.js
   ```
5. Open your browser
    ```sh
   Go to http://localhost:5000 in two tabs or devices to test real-time messaging.
   ```

## Roadmap

- [x] Intiatiate websocket
- [x] Persistent message history
- [ ] Redis Pub/Sub support
- [ ] NGINX Load Balancer integration
- [ ] Authentication / Authorization

## 🙌 Credits
Built by [Munir A](https://github.com/iamaamunir).

## License

Distributed under the Unlicense License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

Munir Abdullahi - [iamaamunir](https://x.com/iamaamunir) 

Project Link: [https://github.com/iamaamunir/distributed-chat-app-with-redis](https://github.com/iamaamunir/distributed-chat-app-with-redis)

<p align="right">(<a href="#readme-top">back to top</a>)</p>