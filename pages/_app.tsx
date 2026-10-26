import '../styles/globals.less';

import { SerwistProvider } from '@serwist/next/react';
import { HTTPError } from 'koajax';
import { configure } from 'mobx';
import { decodeFunctions } from 'mobx-i18n';
import { enableStaticRendering, observer } from 'mobx-react';
import App, { AppContext } from 'next/app';
import Head from 'next/head';
import { Image } from 'react-bootstrap';

import { MDXLayout } from '../components/Layout/MDXLayout';
import { MainNavigator } from '../components/Navigator/MainNavigator';
import { CloudBaseProvider } from '../components/User/CloudBase';
import { authStore } from '../models/Auth';
import { isServer } from '../models/configuration';
import { SessionProps } from '../models/Session';
import {
  createI18nStore,
  I18nContext,
  I18nProps,
  loadSSRLanguage,
} from '../models/Translation';

configure({ enforceActions: 'never' });

enableStaticRendering(isServer());

@observer
export default class CustomApp extends App<I18nProps> {
  static async getInitialProps(context: AppContext) {
    return {
      ...(await App.getInitialProps(context)),
      ...(await loadSSRLanguage(context.ctx)),
    };
  }

  i18nStore = createI18nStore(
    this.props.language,
    JSON.parse(this.props.languageMap, decodeFunctions),
  );

  componentDidMount() {
    window.addEventListener('unhandledrejection', ({ reason }) => {
      const { message, response } = reason as HTTPError;
      const { statusText, body } = response || {};

      const tips = body?.message || statusText || message;

      if (tips) alert(tips);
    });

    const { jwtPayload } = this.props.pageProps as SessionProps;

    if (jwtPayload) authStore.acceptPayload(jwtPayload);
    else void authStore.loadSession();
  }

  componentDidUpdate(previousProps: Readonly<typeof this.props>) {
    if (previousProps.pageProps !== this.props.pageProps) {
      const pageProps = this.props.pageProps as SessionProps;

      if ('jwtPayload' in pageProps)
        authStore.acceptPayload(pageProps.jwtPayload);
      else void authStore.loadSession();
    }
  }

  render() {
    const { Component, pageProps, router } = this.props,
      { t } = this.i18nStore;

    return (
      <SerwistProvider swUrl="/sw.js">
        <CloudBaseProvider>
          <I18nContext.Provider value={this.i18nStore}>
            <Head>
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
              />
            </Head>

            <MainNavigator />

            {router.route.startsWith('/article/') ? (
              <MDXLayout title={router.route.split('/').at(-1)}>
                <Component {...pageProps} />
              </MDXLayout>
            ) : (
              <div className="mt-5 pt-4">
                <Component {...pageProps} />
              </div>
            )}

            <footer className="flex-fill d-flex justify-content-center align-items-center border-top py-4">
              <a
                className="flex-fill d-flex justify-content-center align-items-center"
                href="https://vercel.com?utm_source=create-next-app&amp;utm_medium=default-template&amp;utm_campaign=create-next-app"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('powered_by')}
                <span className="mx-2">
                  <Image
                    src="/vercel.svg"
                    alt="Vercel Logo"
                    width={72}
                    height={16}
                  />
                </span>
              </a>
            </footer>
          </I18nContext.Provider>
        </CloudBaseProvider>
      </SerwistProvider>
    );
  }
}
