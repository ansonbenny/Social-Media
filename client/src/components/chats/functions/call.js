import { axios } from "../../../lib";

export default async (details, audio) => {
    try {
        await axios.post("/call/request", {
            to: details?._id,
            audio,
            toName: details?.name
        })
    } catch (err) {
        if (err?.response?.data?.status == 405) {
            alert("Please Login")

            return true
        } else if (err?.code !== "ERR_CANCELED") {
            alert(err?.response?.data?.message || "Something Went Wrong");
        }
    }
}