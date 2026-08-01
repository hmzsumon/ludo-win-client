import swal from "sweetalert";

export const handleBack = (cb: (action: boolean) => void) => {
  swal({
    /* NEW ▸ Branded Save & Quit modal based on the supplied game UI. */
    title: "Save & Quit",
    text: "Your game has been saved. Do you really want to quit?",
    /* FIX ▸ SweetAlert v1 accepts one class token, not a space-separated list. */
    className: "lw-exit-modal",
    closeOnClickOutside: false,
    closeOnEsc: false,
    buttons: ["NO", "YES"],
  }).then((value) => cb(!!value));
};
