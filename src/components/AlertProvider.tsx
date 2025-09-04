import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function showSuccess(msg: string) {
  toast.success(msg);
}

export function showError(msg: string) {
  toast.error(msg);
}

export default function AlertProvider() {
  return <ToastContainer position="top-right" autoClose={3000} />;
}
