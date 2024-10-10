import app from '@/lib/app';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';

interface AuthLayoutProps {
  children: React.ReactNode;
  heading?: string;
  description?: string;
}

export default function AuthLayout({
  children,
  heading,
  description,
}: AuthLayoutProps) {
  const { t } = useTranslation('common');

  return (

    <div className="flex min-h-screen flex-1 flex-row justify-center align-center">
      <div className="max-w-full sm:mx-auto sm:w-full sm:max-w-3xl w-full ">


        <div className="relative w-full h-full ">
          <Image
            src={app.logoForm}
            className="object-cover"
            alt={app.name}
            layout="fill"
          />
        </div>
      </div>
      <div className='flex flex-col w-full'>
        <Image
          src={app.logoUrl}
          className="mx-auto h-22 pt-2"
          alt={app.name}
          width={130}
          height={70}
        />
        {heading && (
          <h2 className="mt-1 text-center text-2xl font-bold leading-9 pb-2 tracking-tight text-red-500 flex justify-center align-center">
            {t(heading)}
          </h2>
        )}
        {description && (
          <p className="text-center text-red-500 dark:text-white pb-2">
            {description}
          </p>
        )}
        <div className="sm:mx-auto sm:w-full sm:max-w-full sm:max-h-full flex flex-col justify-center align-center ">
          {children}
        </div>
      </div>



    </div>

  );
}
