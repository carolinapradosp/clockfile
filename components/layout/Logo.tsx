import Link from 'next/link';
import logoPV from '@/public/logo-300.png';
import Image from 'next/image';

export default function Logo() {
    return (
        <div className="flex w-full justify-center">
            <Link href="/">
                <Image src={logoPV} alt="Clockfile" width={200} height={50} />
            </Link>
        </div>
    );
}
