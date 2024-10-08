import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';

import * as Yup from 'yup';
import Link from 'next/link';
import { useFormik } from 'formik';
import { Button } from 'react-daisyui';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React, { ReactElement, useEffect, useState, useRef } from 'react';
import type { ComponentStatus } from 'react-daisyui/dist/types';
import { getCsrfToken, signIn, useSession } from 'next-auth/react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import env from '@/lib/env';
import type { NextPageWithLayout } from 'types';
import { AuthLayout } from '@/components/layouts';
import { Alert, InputWithLabel, Loading } from '@/components/shared';
import { authProviderEnabled } from '@/lib/auth';
import Head from 'next/head';
import TogglePasswordVisibility from '@/components/shared/TogglePasswordVisibility';
import AgreeMessage from '@/components/auth/AgreeMessage';
import GoogleReCAPTCHA from '@/components/shared/GoogleReCAPTCHA';
import ReCAPTCHA from 'react-google-recaptcha';
import { maxLengthPolicies } from '@/lib/common';

interface Message {
  text: string | null;
  status: ComponentStatus | null;
}

const Login: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ csrfToken, authProviders, recaptchaSiteKey }) => {
  const router = useRouter();
  const { status } = useSession();
  const { t } = useTranslation('common');
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const [message, setMessage] = useState<Message>({ text: null, status: null });
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const { error, success, token } = router.query as {
    error: string;
    success: string;
    token: string;
  };

  const handlePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  useEffect(() => {
    if (error) {
      setMessage({ text: error, status: 'error' });
    }

    if (success) {
      setMessage({ text: success, status: 'success' });
    }
  }, [error, success]);

  const redirectUrl = token
    ? `/invitations/${token}`
    : env.redirectIfAuthenticated;

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object().shape({
      email: Yup.string().required().email().max(maxLengthPolicies.email),
      password: Yup.string().required().max(maxLengthPolicies.password),
    }),
    onSubmit: async (values) => {
      const { email, password } = values;

      setMessage({ text: null, status: null });

      const response = await signIn('credentials', {
        email,
        password,
        csrfToken,
        redirect: false,
        callbackUrl: redirectUrl,
        recaptchaToken,
      });

      formik.resetForm();
      recaptchaRef.current?.reset();

      if (response && !response.ok) {
        setMessage({ text: response.error, status: 'error' });
        return;
      }
    },
  });

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'authenticated') {
    router.push(redirectUrl);
  }

  const params = token ? `?token=${token}` : '';

  return (
    <>
      <Head>
        <title>{t('login-title')}</title>
      </Head>
      {message.text && message.status && (
        <Alert status={message.status} className="mb-5">
          {t(message.text)}
        </Alert>
      )}
      <div className="rounded p-20  mt-20">




        {authProviders.credentials && (
          <form onSubmit={formik.handleSubmit}>
            <div className="space-y-3">
              <div className='max-w-xl flex flex-col mx-auto'>
                <InputWithLabel
                  type="email"
                  label="Email"
                  name="email"
                  placeholder={t('email')}
                  value={formik.values.email}
                  error={formik.touched.email ? formik.errors.email : undefined}
                  onChange={formik.handleChange}
                />
                <div className="relative flex pb-5">
                  <InputWithLabel
                    type={isPasswordVisible ? 'text' : 'password'}
                    name="password"
                    placeholder={t('Senha')}
                    value={formik.values.password}
                    label={
                      <label className="label">
                        <span className="label-text">{t('Senha')}</span>
                        <span className="label-text-alt">
                          <Link
                            href="/auth/forgot-password"
                            className="text-sm text-error hover:text-[color-mix(in_oklab,oklch(var(--p)),black_7%)]"
                          >
                            {t('forgot-password')}
                          </Link>
                        </span>
                      </label>
                    }
                    error={
                      formik.touched.password ? formik.errors.password : undefined
                    }
                    onChange={formik.handleChange}
                  />
                  <TogglePasswordVisibility
                    isPasswordVisible={isPasswordVisible}
                    handlePasswordVisibility={handlePasswordVisibility}
                  />
              </div>
              </div>
              <GoogleReCAPTCHA
                recaptchaRef={recaptchaRef}
                onChange={setRecaptchaToken}
                siteKey={recaptchaSiteKey}
              />
            </div>
            <div className="mt-3 space-y-3">
              <div className='w-60 mx-auto'>
                <Button
                  type="submit"
                  color="error"
                  loading={formik.isSubmitting}
                  active={formik.dirty}
                  fullWidth
                  size="md"
                  className='text-white hover:bg-red-500'
                >
                  {t('Conectar-se')}
                </Button>
              </div>
              <AgreeMessage text={t('sign-in')} />
            </div>
          </form>
        )}

        {(authProviders.email || authProviders.saml) && (
          <div className="divider"></div>
        )}

        <div className="space-y-3">
          {authProviders.email && (
            <Link
              href={`/auth/magic-link${params}`}
              className="btn btn-outline w-full"
            >
              &nbsp;{t('sign-in-with-email')}
            </Link>
          )}

          {authProviders.saml && (
            <Link href="/auth/sso" className="btn btn-outline w-full">
              &nbsp;{t('continue-with-saml-sso')}
            </Link>
          )}
        </div>
      </div>
      <p className="text-center text-sm text-gray-600 mt-3">
        {t('Não tem conta?')}
        <Link
          href={`/auth/join${params}`}
          className="font-medium text-error hover:text-black"
        >
          &nbsp;{t('Criar Conta')}
        </Link>
      </p>
    </>
  );
};

Login.getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout heading="Bem Vindo " description="Conecte-se na sua conta">
      {page}
    </AuthLayout>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale } = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      csrfToken: await getCsrfToken(context),
      authProviders: authProviderEnabled(),
      recaptchaSiteKey: env.recaptcha.siteKey,
    },
  };
};

export default Login;
