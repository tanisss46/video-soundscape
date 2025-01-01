import { Toast, actionTypes } from "./types";
import { dispatch, genId } from "./state";

const createToast = ({ ...props }: Toast) => {
  const id = genId();

  const update = (props: Toast) =>
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...props, id },
    });
    
  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id });

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id,
    dismiss,
    update,
  };
};

export const toast = Object.assign(createToast, {
  success: (description: string, props?: Omit<Toast, "description">) => {
    return createToast({
      variant: "success",
      description,
      ...props,
    });
  },
  error: (description: string, props?: Omit<Toast, "description">) => {
    return createToast({
      variant: "error",
      description,
      ...props,
    });
  }
});