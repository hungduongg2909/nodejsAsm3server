let io;

module.exports = {
   init: (httpServer) => {
      io = require("socket.io")(httpServer, {
         cors: {
            origin: [
               "http://localhost:3000",
               "http://localhost:3001",
               "http://54.254.177.24:3000",
               "http://54.254.177.24:3001",
            ],
            methods: ["GET", "POST", "PUT", "DELETE"],
            credentials: true,
         },
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
