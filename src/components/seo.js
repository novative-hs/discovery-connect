import Head from "next/head";

const SEO = ({ pageTitle, font }) => (
  <>
    <Head>
      <title>
        {pageTitle && `${pageTitle} - Discovery Connect`}
      </title>
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <meta name="google-site-verification" content="7N0gtoBbLWGpCJLwZjm0Eg6t9J8zrYF6t03gjHpPSHg" />
     <meta
        name="description"
        content="Discovery Connect helps researchers, biobanks, and collection sites securely collect, store, and share biological samples and data for research and diagnostics."
      />

      <meta name="robots" content="index, follow" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />
      <link rel="icon" href="faviconn.ico" />
    </Head>
  </>
);

export default SEO;