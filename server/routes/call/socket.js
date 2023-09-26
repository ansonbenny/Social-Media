import _private from '../../helper/private.js'

export default (socket, io) => {
    socket.on("join video call", async (data) => {
        let res = await _private.getSocketIdTo(data?.to)?.catch((err) => console.log(err))

        io.to(res?.ids).emit("user joined call", data?.id)
    })
}