import { useEffect, useRef } from "react";

const useScroll = () => {
  const ref = useRef({
    main: null,
  });

  useEffect(() => {
    ref?.current?.msgs?.addEventListener?.("wheel", (e) => {});

    ref?.current?.msgs?.addEventListener?.("touchmove", (e) => {
      console.log(e?.touches?.[0]?.clientY);
    });

    return () => {
      ref?.current?.msgs?.removeEventListener?.("wheel", (e) => {});

      ref?.current?.msgs?.removeEventListener?.("touchmove", (e) => {
        console.log(e?.touches?.[0]?.clientY);
      });
    };
  }, []);

  return ref;
};

export default useScroll;
