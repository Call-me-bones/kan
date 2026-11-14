import Head from "next/head";

export const PageHead = ({ title }: { title: string }) => {
  return (
    <Head>
      <title>{title}</title>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1"
      />
      <link rel="manifest" href="/manifest.json" />
      {/* PdLime: Kan icon set (docs/pdlime.md, "Upstream files changed") */}
      <link rel="icon" href="/favicon.ico" sizes="32x32" />
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    </Head>
  );
};
