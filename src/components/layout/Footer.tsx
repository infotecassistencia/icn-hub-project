import { Link } from "@tanstack/react-router";
import { Sprout } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary">
              <Sprout className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="font-display text-lg font-semibold">ICN Hub</div>
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Ponto de encontro entre teoria, prática e carreira. Reunimos cursos, congressos
            e mentorias da nutrição em todo o Brasil.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Explore</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/eventos">Eventos</Link></li>
            <li><Link to="/mentorias">Mentorias</Link></li>
            <li><Link to="/sobre">Sobre</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Para organizadores</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/eventos/novo">Divulgar evento</Link></li>
            <li><Link to="/mentorias/nova">Anunciar mentoria</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6">
          <span>© {new Date().getFullYear()} ICN Hub · Isadora Liberato — Inovação em nutrição</span>
          <span>Feito com carinho para a comunidade da nutrição</span>
        </div>
      </div>
    </footer>
  );
}
