"use client";

import { ROUTES } from "@/components/ludo/pages/router/routerConfig";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import swal from "sweetalert";

interface IUseShowMessageRedirect {
  route?: string;
  message: {
    title: string;
    icon?: string; // "success" | "error" | "warning" | "info" ইত্যাদি
    timer?: number;
  };
}

/**
 * Muestra un mensaje al usuario y lo redirige.
 * Versión Next.js 14 (App Router) usando next/navigation.
 */
const useShowMessageRedirect = () => {
  const [redirect, setRedirect] = useState<IUseShowMessageRedirect>();
  const router = useRouter();

  useEffect(() => {
    if (!redirect?.message.title) return;

    // Mostrar el mensaje (no espera a que se cierre)
    swal({ ...redirect.message, closeOnEsc: false });

    // Redirección inmediata (igual que en react-router)
    router.push(redirect.route || ROUTES.LOBBY);
  }, [redirect, router]);

  return setRedirect;
};

export default useShowMessageRedirect;
