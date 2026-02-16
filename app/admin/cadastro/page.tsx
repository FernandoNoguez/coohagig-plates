import { redirect } from "next/navigation";

export default function AdminCadastroRedirectPage() {
  redirect("/admin/usuarios");
}
