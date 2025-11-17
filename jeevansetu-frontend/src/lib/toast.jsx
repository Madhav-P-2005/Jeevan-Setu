import React from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiInfo,
  FiAlertTriangle,
  FiXCircle,
} from "react-icons/fi";

const toastVariants = {
  success: {
    icon: <FiCheckCircle className="w-5 h-5 text-emerald-300" />,
    accent: "from-emerald-500/80 to-emerald-400/60",
    ring: "ring-emerald-400/40",
  },
  error: {
    icon: <FiXCircle className="w-5 h-5 text-red-300" />,
    accent: "from-red-500/80 to-rose-400/70",
    ring: "ring-red-400/40",
  },
  info: {
    icon: <FiInfo className="w-5 h-5 text-sky-300" />,
    accent: "from-sky-500/80 to-cyan-400/70",
    ring: "ring-sky-400/40",
  },
  warning: {
    icon: <FiAlertTriangle className="w-5 h-5 text-amber-300" />,
    accent: "from-amber-500/80 to-orange-400/70",
    ring: "ring-amber-400/40",
  },
};

const MotionToast = ({ message, type = "info", closeToast }) => {
  const variant = toastVariants[type] || toastVariants.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.94 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`relative flex w-full max-w-md items-start gap-3 rounded-xl px-4 py-3 shadow-2xl shadow-black/50 text-white/90 bg-neutral-950/95 border border-white/10 ring-1 ${variant.ring}`}
    >
      <div className="mt-0.5 flex-shrink-0 rounded-full bg-white/5 p-1.5">
        {variant.icon}
      </div>
      <div className="flex-1 text-sm leading-relaxed">
        {typeof message === "string" ? message : String(message)}
      </div>
      <button
        type="button"
        onClick={closeToast}
        className="ml-2 flex-shrink-0 rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
        aria-label="Dismiss notification"
      >
        ×
      </button>
      <span
        className={`pointer-events-none absolute -inset-px rounded-[0.9rem] bg-gradient-to-r opacity-60 blur-[2px] ${variant.accent}`}
      />
    </motion.div>
  );
};

const triggerToast =
  (type) =>
  (message, options = {}) =>
    toast(
      ({ closeToast }) => (
        <MotionToast message={message} type={type} closeToast={closeToast} />
      ),
      {
        autoClose: 3200,
        pauseOnFocusLoss: false,
        pauseOnHover: true,
        closeButton: false,
        draggable: false,
        icon: false,
        ...options,
      }
    );

const toastApi = {
  success: triggerToast("success"),
  error: triggerToast("error"),
  info: triggerToast("info"),
  warning: triggerToast("warning"),
};

export default toastApi;
