import { useState, useEffect } from "react";
import { State } from "./toast/types";
import { memoryState, listeners, dispatch } from "./toast/state";
import { toast } from "./toast/toast-methods";

function useToast() {
  const [state, setState] = useState<State>(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => 
      dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast };