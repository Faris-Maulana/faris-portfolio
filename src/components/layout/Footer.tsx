export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border-glass py-8">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <span className="text-sm font-display font-semibold text-text-primary">Faris Maulana</span>
            <p className="text-xs text-text-muted font-mono mt-1">AI Engineer & Researcher</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-text-muted">
            <a href="https://github.com/Faris-Maulana" target="_blank" rel="noopener noreferrer" className="hover:text-cyan transition-colors">GitHub</a>
            <a href="https://www.linkedin.com/in/faris-maulana-0035b914a/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan transition-colors">LinkedIn</a>
            <a href="mailto:maulanafaris016@gmail.com" className="hover:text-cyan transition-colors">Email</a>
          </div>

          <div className="text-[10px] text-text-muted font-mono text-center md:text-right">
            <p>Built with Next.js + Supabase</p>
            <p>Deployed on Vercel &copy; {year}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
