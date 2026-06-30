import Link from 'next/link';
import logoPV from '../public/logo-p-v.png';
import Image from 'next/image';

export default function Logo() {
    return (
        <div className="flex w-full justify-start">
            <Link href="/">
                <Image src={logoPV} alt="Carolina Prado Dev" width={250} height={50} />
            </Link>
        </div>

    )
}