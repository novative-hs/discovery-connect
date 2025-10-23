import Head from "next/head";

const SEO = ({ pageTitle }) => {
  const fullTitle = pageTitle
    ? `Discovery Connect - ${pageTitle}`
    : "Discovery Connect | Official Website - Research Collaboration Platform";

  return (
    <Head>
      {/* Basic Meta */}
      <title>{fullTitle}</title>
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <meta name="robots" content="index, follow" />

      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />

      {/* Google Site Verification */}
      <meta
        name="google-site-verification"
        content="1I8aFVJaEfCscjRJFVkPUmuv2elHWroIwu4_J7cDHVo"
      />

      {/* Canonical URL */}
      <link rel="canonical" href="https://discovery-connect.com" />

      {/* Favicon */}
      <link rel="icon" href="https://discovery-connect.com/logo.png" />

      {/* Open Graph (for social + Google preview) */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Discovery Connect" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:url" content="https://discovery-connect.com" />
      <meta
        property="og:image"
        content="https://discovery-connect.com/logo.png"
      />

      {/* Organization Schema (Google Knowledge Graph) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Discovery Connect",
            "url": "https://discovery-connect.com/",
            "logo": "https://discovery-connect.com/logo.png",
            "image": "https://discovery-connect.com/logo.png"
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://discovery-connect.com/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "About",
                "item": "https://discovery-connect.com/about"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Board of Advisors",
                "item": "https://discovery-connect.com/boardadvisor"
              },
              {
                "@type": "ListItem",
                "position": 4,
                "name": "Policy & Privacy",
                "item": "https://discovery-connect.com/policy"
              },
              {
                "@type": "ListItem",
                "position": 5,
                "name": "Terms & Condition",
                "item": "https://discovery-connect.com/terms"
              }
            ]
          })
        }}
      />

    </Head>
  );
};

export default SEO;
