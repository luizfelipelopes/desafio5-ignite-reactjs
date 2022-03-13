import Link from "next/link"


export default function Header() {
  return(
    <div className="container">
      <div className="content">
        <Link href={"/"}>
          <a><img src="/logo.svg" alt="logo" /></a>
        </Link>
      </div>
    </div>
  );
}
