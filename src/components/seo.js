import Head from "next/head";
import { useRouter } from "next/router";

const SEO = ({ pageTitle }) => {
  const router = useRouter();

  // ✅ Correct template literal syntax
  const currentUrl = `https://discovery-connect.com${router.asPath}`;

  // ✅ Dynamic page title
  const fullTitle = pageTitle
    ? `Discovery Connect - ${pageTitle}`
    : "Discovery Connect | Official Website - Research Collaboration Platform";

  return (
    <Head>
      {/* Basic Meta */}
      <title>{fullTitle}</title>
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <meta
        name="robots"
        content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
      />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />

      {/* Google Verification */}
      <meta
        name="google-site-verification"
        content="1I8aFVJaEfCscjRJFVkPUmuv2elHWroIwu4_J7cDHVo"
      />

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* Favicon */}
      <link rel="icon" type="image/png" href="https://discovery-connect.com/assets/img/logo/discoveryconnectlogo.png" />
      <link rel="shortcut icon" type="image/png" href="https://discovery-connect.com/assets/img/logo/discoveryconnectlogo.png" />


      {/* Organization Schema (Structured Data) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Discovery Connect",
            url: "https://discovery-connect.com/",
            logo: "https://discovery-connect.com/assets/img/logo/discoveryconnectlogo.png",
            
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
