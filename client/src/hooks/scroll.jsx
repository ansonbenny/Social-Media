import { useEffect, useReducer, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { axios } from "../lib";

const reducer = (state, { type, data, ...actions }) => {
  // msgs start
  switch (type) {
    case "initial_msg":
      return { ...state, items: data, new: true };

    case "new":
      if (!state?.items?.find?.((obj) => obj?.id == data?.id)) {
        if (state?.items?.length > 0) {
          return { ...state, items: [...state?.items, data], new: true };
        } else {
          return { ...state, items: [data], new: true }
        }
      } else {
        return state;
      }

    case "delete":
      return {
        ...state, items: state?.items?.filter((obj) => {
          return obj?.id !== data?.id
        }), new: false
      }
    case "read": {
      if (data) {
        return {
          ...state, items: state?.items?.map((obj) => {
            if (data?.to !== obj?.from) {
              obj.read = true
            }
            return obj
          })
        }
      }
    }
    // msgs end

    // user / groups start
    case "initial":
      return data

    case "status":
      return {
        ...state, items: state?.items?.map((item) => {
          if (data?.find((obj) => obj?.userId == item?.id)) {
            item.status = true
            return item
          } else {
            item.status = undefined
            return item
          }
        })
      }

    case "to_top": {
      const user = state?.items?.find?.((obj) => obj?.id == data)

      return {
        ...state,
        items: [user, ...state?.items?.filter((obj) => obj?.id !== data)]
      }
    }

    case "readed":
      const items = state?.items?.map((obj) => {
        if (obj?.id == data) {
          state.total = state.total - obj?.unread

          obj.unread = null
        }

        return obj
      })

      return {
        ...state, items
      }

    case "unread":

      const user = state?.items?.find?.((obj) => obj?.id == data)

      if (user?.unread) {
        user.unread += 1
      } else {
        user.unread = 1
      }

      return {
        ...state,
        total: state?.total ? state?.total + 1 : 1,
        items: [user, ...state?.items?.filter((obj) => obj?.id !== data)]
      }

    case "new_user":
      let total = state?.total;

      if (!state?.items?.find((obj) => obj?.id == data?.id)) {
        if (total && data?.unread) {
          total += data?.unread
        } else if (data?.unread) {
          total = data?.unread
        }

        return { ...state, total: total, items: [data, ...state?.items] }
      } else if (actions?.unread) {
        if (total) {
          total += 1
        } else {
          total = 1
        }

        return {
          total: total, items: state?.items?.map((obj) => {
            if (obj?.id == data?.id) {
              if (obj?.unread) {
                obj.unread += 1
              } else {
                obj.unread = 1
              }
            }

            return obj
          })
        }
      } else {
        return state
      }
    // users / groups end

    case "old":
      if (data?.length > 0 && state?.items?.length > 0) {
        if (!state?.items?.find((obj) => obj?.id == data?.[data?.length - 1]?.id)) {
          return { ...state, items: [...state?.items, ...data], new: false };
        } else {
          return state
        }
      } else if (data?.length > 0) {
        return { ...state, items: data, new: false }
      } else {
        return state;
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

    const LoadMore = async () => {
      if (abortControl) {
        abortControl?.abort?.()
      }

      abortControl = new AbortController();

      try {
        let res = await axios.get(url, {
          params: {
            offset: state?.items?.length,
          },
          signal: abortControl?.signal,
        });

        if (res?.["data"]?.data) {
          timeout = setTimeout(() => {
            ref?.current?.loading?.classList?.add?.("hide");

            action({ type: "old", data: res?.["data"]?.data?.items });

            if (res?.["data"]?.data?.online) {
              action({ type: "status", data: res?.["data"]?.data?.online });
            }
          }, 1000)
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
        if (ref?.current?.main?.scrollTop <= 0 && details) {
          ref?.current?.loading?.classList?.remove?.("hide");
          LoadMore?.();
        } else if (!details && ref?.current?.main?.scrollHeight - ((ref?.current?.main?.clientHeight + ref?.current?.main?.scrollTop)) <= 10) {
          ref?.current?.loading?.classList?.remove?.("hide");
          LoadMore?.()
        }
      }
    };

    const onWheelTouch = () => {
      if (state?.items?.length > 0) {
        if (
          ref?.current?.main?.scrollHeight <= ref?.current?.main?.clientHeight
        ) {
          ref?.current?.loading?.classList?.remove?.("hide");
          LoadMore?.();
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
  }, [state?.items]);

  return [ref, state, action];
};

export default useScroll;
