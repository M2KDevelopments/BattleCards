import Fastify from 'fastify'
import FastifySocketIO from "fastify-socket.io"
import { onConnection } from "./websockets.js"

// https://www.youtube.com/watch?v=lNUaekN8r24
// https://www.npmjs.com/package/fastify
const fastify = Fastify({ logger: true })

// Use socket.io in Fastify app
fastify.register(FastifySocketIO, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH", "DELETE"],
    }
});

fastify.ready().then(() => {
    fastify.log.info((`🔥🔥🔥 Battle Cards Server 🃏 Running on PORT -- ${port}`));
    fastify.io.on('connection', onConnection)
})

// Run the server!
fastify.listen({ port: process.env.PORT || 3002 }, (err, address) => {
    if (err) throw err
    // Server is now listening on ${address}
});