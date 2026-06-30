import logoPV from '../public/logo-p-v.png';
import Image from 'next/image';

export default function Logo() {
    return (
        <Image src={logoPV} alt="Carolina Prado Dev" width={250} height={50} />
    )
}