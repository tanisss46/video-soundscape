import { Toast, actionTypes } from "./types";
import { dispatch, genId } from "./state";

export function toast({ ...props }: Toast) {
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
}

toast.success = (description: string, props?: Omit<Toast, "description">) => {
  return toast({
    variant: "success",
    description,
    ...props,
  });
};

toast.error = (description: string, props?: Omit<Toast, "description">) => {
  return toast({
    variant: "error",
    description,
    ...props,
  });
};

export { toast };