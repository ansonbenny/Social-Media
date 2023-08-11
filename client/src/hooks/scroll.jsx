import { useEffect, useReducer, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { axios } from "../lib";

const reducer = (state, { type, data }) => {
  switch (type) {
    case "initial":
      return { ...state, msgs: data, new: true };

    case "new":
      if (!state?.msgs?.find?.((obj) => obj?.id == data?.id)) {
        if (state?.msgs?.length > 0) {
          return { ...state, msgs: [...state?.msgs, data], new: true };
        } else {
          return { ...state, msgs: [data], new: true }
        }
      } else {
        return state;
      }

    case "old":
      if (data?.length > 0 && state?.msgs?.length > 0) {
        if (!state?.msgs?.find((obj) => obj?.id == data?.[data?.length - 1]?.id)) {
          const old = state?.msgs;

          return { ...state, msgs: [...data, ...old], new: false };
        } else {
          return state
        }
      } else if (data?.length > 0) {
        return { ...state, msgs: data, new: false }
      } else {
        return state;
      }
    case "read": {
      if (data) {
        return {
          ...state, msgs: state?.msgs?.map((obj) => {
            if (data?.to !== obj?.from) {
              obj.read = true
            }
            return obj
          })
        }
      }
    }

    default:
      return state;
  }
};

const useScroll = ({ url, details }) => {
  const ref = useRef({
    main: null,
    loading: null
  });

  const navigate = useNavigate()

  const [state, action] = useReducer(reducer, {})

  useEffect(() => {
    let abortControl;

    let timeout;

    const LoadMoreMsgs = async () => {
      if (abortControl) {
        abortControl?.abort?.()
      }

      abortControl = new AbortController();

      try {
        if (details?.user) {
          let res = await axios.get(url, {
            params: {
              skip: state?.msgs?.length,
            },
            signal: abortControl?.signal,
          });

          if (res?.["data"]?.data) {
            timeout = setTimeout(() => {
              ref?.current?.loading?.classList?.add?.("hide");
              action({ type: "old", data: res?.["data"]?.data?.chat?.msgs });
            }, 1000)
          }
        }
      } catch (err) {
        if (err?.code !== "ERR_CANCELED") {
          ref?.current?.loading?.classList?.add?.("hide");

          if (err?.response?.data?.status == 405) {
            navigate("/");
          } else {
            alert(err?.response?.data?.message || "Something Went Wrong");
          }
        }
      }
    };

    const onScroll = (e) => {
      e?.preventDefault?.();

      if (
        ref?.current?.main?.scrollHeight > ref?.current?.main?.clientHeight
      ) {
        if (ref?.current?.main?.scrollTop <= 0) {
          ref?.current?.loading?.classList?.remove?.("hide");
          LoadMoreMsgs?.();
        }
      }
    };

    const onWheelTouch = () => {
      if (state?.length > 0) {
        if (
          ref?.current?.main?.scrollHeight <= ref?.current?.main?.clientHeight
        ) {
          ref?.current?.loading?.classList?.remove?.("hide");
          LoadMoreMsgs?.();
        }
      }
    };

    ref?.current?.main?.addEventListener?.("wheel", onWheelTouch);

    ref?.current?.main?.addEventListener?.("touchmove", onWheelTouch);

    ref?.current?.main?.addEventListener?.("scroll", onScroll);

    return () => {
      ref?.current?.main?.removeEventListener?.("wheel", onWheelTouch);

      ref?.current?.main?.removeEventListener?.("touchmove", onWheelTouch);

      ref?.current?.main?.removeEventListener?.("scroll", onScroll);

      clearTimeout(timeout)
    };
  }, [state?.msgs]);

  return [ref, state, action];
};

export default useScroll;
