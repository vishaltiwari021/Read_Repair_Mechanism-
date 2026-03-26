function Footer() {
  return (
    <footer className="footer items-center p-8 bg-neutral text-neutral-content rounded-box my-8">
      <aside className="items-center grid-flow-col">
        <p className="font-medium text-lg">Read Repair Frontend</p>
        <p className="opacity-70 text-sm ml-4">
          Feature-based frontend structure with a live demo workspace connected to the backend repair service.
        </p>
      </aside> 
      <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
        <a href="#overview" className="btn btn-sm btn-ghost normal-case hover:text-primary">
          Back to top
        </a>
      </nav>
    </footer>
  );
}

export default Footer;