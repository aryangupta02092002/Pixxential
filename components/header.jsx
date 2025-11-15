import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Header = () => {
    return (
        <header className='fixed top-6 left-1/2 transform -transform-x-1/2 z-50 text-nowrap'>
            <div className='backdrop-blur-md bg-white/10 border-white/20 rounded-full px-8 py-3 flex items-center justify-between'>

                <Link href='/' className="mr-10 md:mr-20">
                    <Image
                        src="/logos/logo.png"
                        alt="Pixxential"
                        className="min-w-24 object-cover"
                        width={96}
                        height={24}
                    />
                </Link>
            </div>
        </header>
    )
}

export default Header;