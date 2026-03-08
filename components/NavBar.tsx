'use client';

import Link from 'next/link';
import Image from 'next/image';
import posthog from 'posthog-js';

const NavBar = () => {
  const captureNavClick = (label: string, href: string) => {
    posthog.capture('nav_link_clicked', { label, href });
  };

  return (
    <header>
        <nav>
            <Link href = "/" className = 'logo' onClick={() => captureNavClick('logo', '/')}>
                <Image src='/icons/logo.png' alt='logo' width={24} height = {24} />
                <p>DevEvent</p>
            </Link>

            <ul>
                <Link href='/' onClick={() => captureNavClick('Home', '/')}>Home</Link>
                <Link href='/' onClick={() => captureNavClick('Events', '/')}>Events</Link>
                <Link href='/' onClick={() => captureNavClick('Create Event', '/')}>Create Event</Link>
            </ul>
        </nav>
    </header>
  )
}

export default NavBar