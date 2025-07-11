const { Server } = require("socket.io");

let io;

module.exports = {
   init: (httpServer) => {
      io = new Server(httpServer, {
         cors: {
            origin: [
               "http://localhost:3000",
               "http://localhost:3001",
               "http://54.254.177.24:3000",
               "http://54.254.177.24:3001",
               "https://famous-hotteok-6fb3ad.netlify.app",
               "https://686f7c25e3957f0008ed14db--famous-hotteok-6fb3ad.netlify.app",
               "https://soft-praline-a96359.netlify.app",
               "https://687083d34771cc5a8a51a00b--soft-praline-a96359.netlify.app",
            ],
            methods: ["GET", "POST", "PUT", "DELETE"],
            credentials: true,
         },
         transports: ["websocket"],
      });
      return io;
   },
   getIO: () => {
      if (!io) {
         throw new Error("Socket.io not initialized!");
      }
      return io;
   },
};
