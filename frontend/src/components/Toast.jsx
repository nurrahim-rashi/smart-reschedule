import { useEffect, useRef } from "react";

const TYPE_CLASS = {
  success: "alert-success",
  error: "alert-error",
  info: "alert-info",
};

// Notifikasi di pojok kanan atas, tetap terlihat walaupun halaman di-scroll,
// dan hilang sendiri setelah beberapa detik.
function Toast({ message, type = "success", onClose, duration = 4000 }) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timer = setTimeout(() => onCloseRef.current(), duration);
    return () => clearTimeout(timer);
  }, [message, duration]);

  if (!message) {
    return null;
  }

  return (
    <div className="toast toast-top toast-end z-50">
      <div className={`alert ${TYPE_CLASS[type]} shadow-lg max-w-sm`}>
        <span className="whitespace-normal">{message}</span>

        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost btn-xs"
          aria-label="Tutup notifikasi"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default Toast;
